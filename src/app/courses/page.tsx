"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Course } from "@/types";
import { Search, BookOpen, ChevronRight } from "lucide-react";

const FILTERS = ["Hamısı", "Pulsuz", "Pullu", "Kodla"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Hamısı");

  useEffect(() => {
    api.get("/api/courses/public")
      .then(r => { setCourses(r.data); setFiltered(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = courses;
    if (activeFilter === "Pulsuz") result = result.filter(c => c.accessType === "FREE");
    if (activeFilter === "Pullu") result = result.filter(c => c.accessType === "PAID");
    if (activeFilter === "Kodla") result = result.filter(c => c.accessType === "CODE_REQUIRED");
    if (search) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, activeFilter, courses]);

  const accessBadge = (course: Course) => ({
    FREE: { label: "Pulsuz", className: "badge-free" },
    PAID: { label: `${course.price} AZN`, className: "badge-paid" },
    CODE_REQUIRED: { label: "Kodla", className: "badge-code" },
  }[course.accessType]);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "48px 0 32px" }}>
        <div className="container">
          <h1 className="animate-fade-up" style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 8 }}>
            Bütün kurslar
          </h1>
          <p className="animate-fade-up delay-1" style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 28 }}>
            {courses.length} kurs mövcuddur
          </p>

          {/* Search + Filter */}
          <div className="animate-fade-up delay-2" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: 240, maxWidth: 400 }}>
              <Search size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Kurs axtar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: 40 }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="btn"
                  style={{
                    fontSize: 13,
                    padding: "8px 16px",
                    background: activeFilter === f ? "var(--accent)" : "var(--bg-card)",
                    color: activeFilter === f ? "white" : "var(--text-secondary)",
                    border: `1px solid ${activeFilter === f ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card" style={{ height: 340 }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: "50%" }} />
                    <div className="skeleton" style={{ height: 18 }} />
                    <div className="skeleton" style={{ height: 12, width: "80%" }} />
                    <div className="skeleton" style={{ height: 12, width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
              <Search size={44} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: 16 }}>Heç nə tapılmadı</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Axtarış sözünü dəyişin</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((course, i) => {
                const badge = accessBadge(course);
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className={`card animate-fade-up`}
                    style={{ textDecoration: "none", display: "block", overflow: "hidden", animationDelay: `${i * 0.05}s` }}
                  >
                    <div style={{
                      height: 180,
                      background: course.thumbnailUrl
                        ? `url(${course.thumbnailUrl}) center/cover`
                        : "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))",
                      position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {!course.thumbnailUrl && <BookOpen size={36} color="var(--accent)" style={{ opacity: 0.4 }} />}
                      <div style={{ position: "absolute", top: 12, left: 12 }}>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
                      </div>
                    </div>
                    <div style={{ padding: "18px 20px 20px" }}>
                      <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {course.teacherName}
                      </p>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, color: "var(--text-primary)" }}>
                        {course.title}
                      </h3>
                      <p style={{
                        fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {course.description || "Bu kurs haqqında məlumat yoxdur."}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <BookOpen size={12} />
                          {course.sections?.length || 0} bölmə
                        </span>
                        <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          Bax <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
