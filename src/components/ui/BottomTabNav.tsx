"use client";

import { LucideIcon } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface BottomTabNavProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export default function BottomTabNav({ items, active, onChange }: BottomTabNavProps) {
  return (
    <nav className="bottom-tab-nav">
      {items.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={active === id ? "active" : ""}
        >
          <div style={{ position: "relative", display: "inline-flex" }}>
            <Icon size={20} />
            {badge !== undefined && badge > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -7,
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--accent)", color: "white",
                fontSize: 8, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
