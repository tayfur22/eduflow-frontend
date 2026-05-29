"use client";

import { BookOpen, Trophy, Search, BarChart2, FileText } from "lucide-react";

// Base skeleton block
export function Skeleton({ width = "100%", height = 16, radius = 6, style = {} }: {
  width?: string | number;
  height?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

// Course card skeleton
export function CourseCardSkeleton() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Skeleton height={180} radius={0} />
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Skeleton width="45%" height={11} />
        <Skeleton height={18} />
        <Skeleton width="90%" height={13} />
        <Skeleton width="70%" height={13} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <Skeleton width={80} height={13} />
          <Skeleton width={50} height={13} />
        </div>
      </div>
    </div>
  );
}

// Dashboard stat skeleton
export function StatCardSkeleton() {
  return (
    <div className="card" style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      <Skeleton width={44} height={44} radius={12} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="60%" height={24} />
        <Skeleton width="80%" height={13} />
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <Skeleton width={i === 0 ? "80%" : "60%"} height={14} />
        </td>
      ))}
    </tr>
  );
}

// Certificate skeleton
export function CertificateSkeleton() {
  return (
    <div className="card" style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Skeleton width={52} height={52} radius={14} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="55%" height={17} />
          <Skeleton width="35%" height={13} />
          <Skeleton width={100} height={22} radius={100} style={{ marginTop: 2 }} />
        </div>
        <Skeleton width={80} height={34} radius={8} />
      </div>
    </div>
  );
}

// Lesson list skeleton
export function LessonSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <Skeleton width={36} height={36} radius={8} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={11} />
      </div>
      <Skeleton width={60} height={11} />
    </div>
  );
}

// ─── Empty States ───────────────────────────────────────────────

function EmptyIllustration({ icon: Icon, color }: { icon: any; color: string }) {
  return (
    <div style={{ position: "relative", margin: "0 auto 20px", width: 80, height: 80 }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={32} color={color} style={{ opacity: 0.6 }} />
      </div>
      {/* Decorative dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 6, height: 6, borderRadius: "50%",
          background: `${color}40`,
          top: "50%", left: "50%",
          transform: `rotate(${deg}deg) translate(46px, -50%)`,
        }} />
      ))}
    </div>
  );
}

export function EmptyCourses() {
  return (
    <div className="card" style={{ padding: "64px 40px", textAlign: "center" }}>
      <EmptyIllustration icon={BookOpen} color="var(--accent)" />
      <h3 style={{ fontSize: 18, marginBottom: 8 }}>Kurs tapılmadı</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 280, margin: "0 auto 20px", lineHeight: 1.6 }}>
        Axtarış sözünüzü dəyişin və ya filtrleri sıfırlayın
      </p>
    </div>
  );
}

export function EmptyCertificates() {
  return (
    <div className="card" style={{ padding: "64px 40px", textAlign: "center" }}>
      <EmptyIllustration icon={Trophy} color="#7c3aed" />
      <h3 style={{ fontSize: 18, marginBottom: 8 }}>Hələ sertifikat yoxdur</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
        Kursu 100% tamamladıqdan sonra sertifikat əldə edə bilərsiniz
      </p>
    </div>
  );
}

export function EmptySearch() {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
      <EmptyIllustration icon={Search} color="var(--text-muted)" />
      <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Heç nə tapılmadı</p>
      <p style={{ fontSize: 14 }}>Axtarış sözünü dəyişin</p>
    </div>
  );
}

export function EmptyStats() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <EmptyIllustration icon={BarChart2} color="var(--accent-2)" />
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Hələ məlumat yoxdur</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Kurs tamamladıqca statistika burada görünəcək</p>
    </div>
  );
}

export function EmptyQuizzes() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <EmptyIllustration icon={FileText} color="#10b981" />
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Quiz nəticəsi yoxdur</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>İlk quizi həll edin!</p>
    </div>
  );
}
