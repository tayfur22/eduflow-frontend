"use client";

import { useEffect, useRef, useState } from "react";

// ─── Circular Progress ───────────────────────────────────────────
interface CircularProgressProps {
  value: number;        // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color = "var(--accent)",
  label,
  sublabel,
  animate = true,
}: CircularProgressProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayed / 100) * circumference;

  useEffect(() => {
    if (!animate) { setDisplayed(value); return; }
    let start: number | null = null;
    const duration = 1200;
    const from = 0;
    const to = value;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, animate]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>

      {/* Center label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2,
      }}>
        {label ? (
          <span style={{ fontSize: size * 0.18, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)", lineHeight: 1 }}>
            {label}
          </span>
        ) : (
          <span style={{ fontSize: size * 0.2, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)", lineHeight: 1 }}>
            {displayed}%
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: size * 0.1, color: "var(--text-muted)", lineHeight: 1 }}>{sublabel}</span>
        )}
      </div>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────
interface ConfettiProps {
  trigger: boolean;
  onDone?: () => void;
}

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  angle: number;
  spin: number;
  gravity: number;
  alpha: number;
};

const COLORS = ["#e8541a", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

function createParticle(x: number, y: number): Particle {
  const angle = (Math.random() * Math.PI * 2);
  const speed = 4 + Math.random() * 8;
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 5 + Math.random() * 6,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 10,
    gravity: 0.25 + Math.random() * 0.15,
    alpha: 1,
  };
}

export function Confetti({ trigger, onDone }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Burst from center
    const cx = canvas.width / 2;
    const cy = canvas.height / 3;
    const particles: Particle[] = Array.from({ length: 120 }, () => createParticle(cx, cy));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.angle += p.spin;
        if (p.y > canvas.height * 0.85) p.alpha -= 0.05;
        else if (p.alpha > 0.8) p.alpha -= 0.003;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [trigger]);

  if (!trigger) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        zIndex: 9999, width: "100%", height: "100%",
      }}
    />
  );
}

// ─── Progress Ring (compact, for course cards) ──────────────────
export function ProgressRing({ value, size = 48, color = "var(--accent)" }: {
  value: number; size?: number; color?: string;
}) {
  const sw = 4;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - dash}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.22, fontWeight: 700, color: "var(--text-primary)",
      }}>
        {value}
      </div>
    </div>
  );
}
