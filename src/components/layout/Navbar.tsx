"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLangStore } from "@/store/langStore";
import LangSelector from "@/components/shared/LangSelector";
import {
  Sun, Moon, GraduationCap, LogOut, User,
  BookOpen, LayoutDashboard, Menu, X, CreditCard,
  Bell, Search, ChevronDown, Settings, Award,
  Sparkles, Key
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useLangStore();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [pathname]);

  const handleLogout = () => { logout(); router.push("/"); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  };

  const navLinks = user
    ? user.role === "TEACHER"
      ? [
          { href: "/dashboard/teacher", label: t("nav_dashboard"), icon: LayoutDashboard },
          { href: "/courses", label: t("nav_courses"), icon: BookOpen },
        ]
      : [
          { href: "/dashboard/student", label: t("nav_dashboard"), icon: LayoutDashboard },
          { href: "/courses", label: t("nav_courses"), icon: BookOpen },
          { href: "/payments", label: "Ödənişlər", icon: CreditCard },
        ]
    : [{ href: "/courses", label: t("nav_courses"), icon: BookOpen }];

  const profileMenuItems = user?.role === "TEACHER"
    ? [
        { href: "/dashboard/teacher", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/teacher/quiz/create", label: "Quiz Yarat", icon: Sparkles },
        { href: "/dashboard/teacher/codes", label: "Giriş Kodları", icon: Key },
      ]
    : [
        { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
        { href: "/certificates", label: "Sertifikatlar", icon: Award },
        { href: "/payments", label: "Ödənişlər", icon: CreditCard },
        { href: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
      ];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        transition: "all 0.3s ease",
        background: scrolled ? "var(--bg-card)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              Edu<span style={{ color: "var(--accent)" }}>Flow</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, textDecoration: "none",
                fontSize: 14, fontWeight: 500,
                color: pathname === href ? "var(--accent)" : "var(--text-secondary)",
                background: pathname === href ? "var(--accent-soft)" : "transparent",
                transition: "all 0.18s ease",
              }}
                onMouseEnter={e => { if (pathname !== href) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; }}
                onMouseLeave={e => { if (pathname !== href) { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="btn btn-ghost"
              style={{ padding: 8, width: 36, height: 36, justifyContent: "center", borderRadius: 8, border: "1px solid var(--border)" }}
              aria-label="Axtar"
            >
              <Search size={15} />
            </button>

            <LangSelector />

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: 8, width: 36, height: 36, justifyContent: "center", borderRadius: 8, border: "1px solid var(--border)" }}>
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {user ? (
              <>
                {/* Notification bell */}
                <div className="tooltip-wrap" style={{ position: "relative" }}>
                  <button className="btn btn-ghost" style={{ padding: 8, width: 36, height: 36, justifyContent: "center", borderRadius: 8, border: "1px solid var(--border)", position: "relative" }}>
                    <Bell size={15} />
                    <span className="notif-dot" />
                  </button>
                  <span className="tooltip-box">Bildirişlər</span>
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 10px 5px 6px",
                      background: profileOpen ? "var(--accent-soft)" : "var(--bg-secondary)",
                      border: `1px solid ${profileOpen ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 10, cursor: "pointer", transition: "all 0.18s ease",
                    }}
                  >
                    <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>
                      {user.fullName[0]}
                    </div>
                    <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} color="var(--text-muted)" style={{ transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "none" }} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="animate-fade-in" style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "var(--bg-card)", border: "1px solid var(--border)",
                      borderRadius: 12, boxShadow: "var(--shadow-lg)",
                      minWidth: 220, overflow: "hidden", zIndex: 200,
                      animation: "fadeDown 0.18s ease forwards",
                    }}>
                      {/* User info header */}
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif", flexShrink: 0 }}>
                            {user.fullName[0]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.fullName}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                          </div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "var(--accent-soft)", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {user.role === "TEACHER" ? "Müəllim" : "Şagird"}
                          </span>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div style={{ padding: "6px 8px" }}>
                        {profileMenuItems.map(({ href, label, icon: Icon }) => (
                          <Link key={href} href={href} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 10px", borderRadius: 8,
                            textDecoration: "none", fontSize: 13, color: "var(--text-secondary)",
                            transition: "all 0.15s ease",
                          }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                          >
                            <Icon size={15} color="var(--accent)" /> {label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div style={{ padding: "6px 8px", borderTop: "1px solid var(--border)" }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "9px 10px", borderRadius: 8, background: "none", border: "none",
                            cursor: "pointer", fontSize: 13, color: "#dc2626", transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <LogOut size={15} /> {t("nav_logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hide-mobile" style={{ display: "flex", gap: 6 }}>
                <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13, padding: "7px 14px", border: "1px solid var(--border)" }}>
                  {t("nav_login")}
                </Link>
                <Link href="/register" className="btn btn-primary" style={{ fontSize: 13, padding: "7px 16px" }}>
                  {t("nav_register")}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="hide-desktop"
              onClick={() => setMenuOpen(v => !v)}
              style={{ padding: 8, background: "none", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-primary)", display: "flex" }}
              aria-label="Menyu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Search bar (dropdown) ── */}
        {searchOpen && (
          <div className="animate-fade-in" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)", padding: "12px 0" }}>
            <div className="container">
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    ref={searchRef}
                    className="input"
                    placeholder="Kurs axtar..."
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }}>
                  Axtar
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="btn btn-secondary" style={{ fontSize: 13, padding: "10px 14px" }}>
                  <X size={15} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="animate-slide-in hide-desktop" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)", padding: "12px 0 20px" }}>
            <div className="container" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", borderRadius: 9, textDecoration: "none",
                  fontSize: 15, fontWeight: 500,
                  color: pathname === href ? "var(--accent)" : "var(--text-primary)",
                  background: pathname === href ? "var(--accent-soft)" : "transparent",
                }}>
                  <Icon size={16} /> {label}
                </Link>
              ))}

              {!user && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link href="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 14 }}>{t("nav_login")}</Link>
                  <Link href="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 14 }}>{t("nav_register")}</Link>
                </div>
              )}

              {user && (
                <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 9, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", cursor: "pointer", fontSize: 14, fontWeight: 500, marginTop: 8 }}>
                  <LogOut size={15} /> {t("nav_logout")}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: 64 }} />
    </>
  );
}
