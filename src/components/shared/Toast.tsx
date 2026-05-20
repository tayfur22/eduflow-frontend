"use client";

import { useToastStore } from "@/store/toastStore";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: "#16a34a" },
  error:   { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", icon: "#dc2626" },
  info:    { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", icon: "#2563eb" },
  warning: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", icon: "#d97706" },
};

// Dark mode colors
const darkColors = {
  success: { bg: "#052e16", border: "#166534", text: "#86efac", icon: "#4ade80" },
  error:   { bg: "#450a0a", border: "#7f1d1d", text: "#fca5a5", icon: "#f87171" },
  info:    { bg: "#0c1a2e", border: "#1e3a5f", text: "#93c5fd", icon: "#60a5fa" },
  warning: { bg: "#2d1a00", border: "#78350f", text: "#fcd34d", icon: "#fbbf24" },
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      maxWidth: 360,
      pointerEvents: "none",
    }}>
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        const c = colors[toast.type];
        return (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid var(--toast-border, ${c.border})`,
              background: `var(--toast-bg, ${c.bg})`,
              color: `var(--toast-text, ${c.text})`,
              fontSize: 14,
              lineHeight: 1.45,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              pointerEvents: "all",
              animation: "slideUp 0.22s ease",
            }}
          >
            <Icon size={17} color={c.icon} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 2, color: c.icon, flexShrink: 0,
                display: "flex", alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
