"use client";

import { useState } from "react";
import { useLangStore } from "@/store/langStore";
import { Lang } from "@/lib/translations";
import { ChevronDown, Globe } from "lucide-react";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "tr", label: "Türkçe",     flag: "🇹🇷" },
  { code: "en", label: "English",    flag: "🇬🇧" },
];

export default function LangSelector() {
  const { lang, setLang } = useLangStore();
  const [open, setOpen] = useState(false);

  const current = LANGS.find(l => l.code === lang)!;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost"
        style={{
          padding: "7px 10px",
          borderRadius: 8,
          gap: 5,
          fontSize: 13,
          height: 36,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <span style={{ fontSize: 15 }}>{current.flag}</span>
        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{current.code.toUpperCase()}</span>
        <ChevronDown size={13} color="var(--text-muted)" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "6px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 50,
            minWidth: 160,
            animation: "fadeIn 0.15s ease",
          }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 7,
                  background: lang === l.code ? "var(--accent-soft)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => {
                  if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)";
                }}
                onMouseLeave={e => {
                  if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 18 }}>{l.flag}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: lang === l.code ? 600 : 400,
                  color: lang === l.code ? "var(--accent)" : "var(--text-primary)",
                }}>
                  {l.label}
                </span>
                {lang === l.code && (
                  <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
