"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import {
  Sun, Moon, GraduationCap, LogOut, User,
  BookOpen, LayoutDashboard, Menu, X
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinks = user
    ? user.role === "TEACHER"
      ? [
          { href: "/dashboard/teacher", label: "Dashboard", icon: LayoutDashboard },
          { href: "/courses", label: "Kurslar", icon: BookOpen },
        ]
      : [
          { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
          { href: "/courses", label: "Kurslar", icon: BookOpen },
        ]
    : [{ href: "/courses", label: "Kurslar", icon: BookOpen }];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        background: scrolled
          ? "var(--bg-card)"
          : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36,
            background: "var(--accent)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}>
            Edu<span style={{ color: "var(--accent)" }}>Flow</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                color: pathname === href ? "var(--accent)" : "var(--text-secondary)",
                background: pathname === href ? "var(--accent-soft)" : "transparent",
                transition: "all 0.18s ease",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: "8px", borderRadius: 8, width: 36, height: 36, justifyContent: "center" }}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun size={17} />
              : <Moon size={17} />
            }
          </button>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* User info */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px",
                background: "var(--bg-secondary)",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 26, height: 26,
                  background: "var(--accent)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={13} color="white" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  {user.fullName.split(" ")[0]}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: 100,
                  background: user.role === "TEACHER" ? "var(--accent-soft)" : "#eff6ff",
                  color: user.role === "TEACHER" ? "var(--accent)" : "var(--accent-2)",
                }}>
                  {user.role === "TEACHER" ? "Müəllim" : "Şagird"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ padding: "8px", borderRadius: 8, width: 36, height: 36, justifyContent: "center", color: "var(--text-muted)" }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/login" className="btn btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>
                Giriş
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                Qeydiyyat
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-ghost mobile-menu-btn"
            style={{ padding: "8px", borderRadius: 8, width: 36, height: 36, justifyContent: "center" }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          padding: "12px 24px 20px",
          animation: "fadeIn 0.2s ease",
        }}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                color: "var(--text-primary)",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <Icon size={16} color="var(--accent)" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
