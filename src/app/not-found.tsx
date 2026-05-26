"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-secondary)", padding: "40px 24px",
      flexDirection: "column", textAlign: "center",
    }}>
      <div className="animate-fade-up" style={{ maxWidth: 480 }}>
        {/* Logo icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "var(--accent-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
        }}>
          <GraduationCap size={36} color="var(--accent)" />
        </div>

        {/* 404 */}
        <p style={{
          fontSize: 96, fontWeight: 800, lineHeight: 1,
          color: "var(--border-strong)", marginBottom: 16,
          fontFamily: "Syne, sans-serif",
        }}>
          404
        </p>

        <h1 style={{ fontSize: 26, marginBottom: 12 }}>
          Səhifə tapılmadı
        </h1>
        <p style={{
          color: "var(--text-secondary)", fontSize: 15,
          lineHeight: 1.7, marginBottom: 32,
        }}>
          Axtardığınız səhifə mövcud deyil, silinmiş və ya köçürülmüş ola bilər.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary" style={{ textDecoration: "none", gap: 8 }}>
            <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} />
            Ana səhifə
          </Link>
          <Link href="/courses" className="btn btn-secondary" style={{ textDecoration: "none", gap: 8 }}>
            <Search size={15} />
            Kurslara bax
          </Link>
        </div>
      </div>
    </div>
  );
}
