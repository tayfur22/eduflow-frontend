"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Course } from "@/types";
import { useLangStore } from "@/store/langStore";
import { ArrowRight, BookOpen, Users, Award, Zap, Star, ChevronRight, Play } from "lucide-react";

function CourseCard({ course, delay }: { course: Course; delay: number }) {
  const { t } = useLangStore();

  const accessBadge = {
    FREE:          { label: t("filter_free"),  className: "badge-free" },
    PAID:          { label: `${course.price} AZN`, className: "badge-paid" },
    CODE_REQUIRED: { label: t("filter_code"),  className: "badge-code" },
  }[course.accessType];

  return (
    <Link href={`/courses/${course.id}`} className={`card animate-fade-up delay-${delay}`}
      style={{ textDecoration: "none", display: "block", overflow: "hidden" }}>
      <div style={{
        height: 180,
        background: course.thumbnailUrl
          ? `url(${course.thumbnailUrl}) center/cover`
          : "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!course.thumbnailUrl && <BookOpen size={40} color="var(--accent)" style={{ opacity: 0.4 }} />}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span className={`badge ${accessBadge.className}`}>{accessBadge.label}</span>
        </div>
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {course.teacherName}
        </p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>
          {course.title}
        </h3>
        <p style={{
          fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {course.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <BookOpen size={12} /> {course.sections?.length || 0} {t("sections")}
          </span>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useLangStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/courses/public")
      .then(r => setCourses(r.data.slice(0, 6)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {/* ── HERO ── */}
      <section style={{
        minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -200, width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -150, left: -100, width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,110,232,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ maxWidth: 700 }}>
            {/* Tag */}
            <div className="animate-fade-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", background: "var(--accent-soft)", borderRadius: 100,
              marginBottom: 28, border: "1px solid rgba(232,84,26,0.15)",
            }}>
              <Zap size={13} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{t("hero_tag")}</span>
            </div>

            {/* Heading — düzəldilmiş yazı */}
            <h1 className="animate-fade-up delay-1" style={{
              fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 800,
              lineHeight: 1.05, marginBottom: 24, color: "var(--text-primary)",
            }}>
              {t("hero_title_1")}
              <br />
              <span style={{ color: "var(--accent)" }}>{t("hero_title_2")}</span>{" "}
              {t("hero_title_3")}
            </h1>

            <p className="animate-fade-up delay-2" style={{
              fontSize: "clamp(16px, 2vw, 19px)", color: "var(--text-secondary)",
              lineHeight: 1.7, marginBottom: 36, maxWidth: 540,
            }}>
              {t("hero_desc")}
            </p>

            <div className="animate-fade-up delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/courses" className="btn btn-primary" style={{ fontSize: 15, padding: "13px 28px" }}>
                {t("hero_btn_courses")} <ArrowRight size={17} />
              </Link>
              <Link href="/register" className="btn btn-secondary" style={{ fontSize: 15, padding: "13px 28px" }}>
                {t("hero_btn_free")}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-4" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 32, marginTop: 80, paddingTop: 48,
            borderTop: "1px solid var(--border)", maxWidth: 540,
          }}>
            {[
              { icon: Users,   value: "2,400+", key: "stat_students" as const },
              { icon: BookOpen, value: "180+",  key: "stat_courses" as const },
              { icon: Award,   value: "1,200+", key: "stat_certificates" as const },
              { icon: Star,    value: "4.9",    key: "stat_rating" as const },
            ].map(({ icon: Icon, value, key }) => (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{
                  width: 44, height: 44, background: "var(--accent-soft)", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
                }}>
                  <Icon size={20} color="var(--accent)" />
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                  {value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>{t(key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 8 }}>{t("popular_courses")}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>{t("popular_desc")}</p>
            </div>
            <Link href="/courses" className="btn btn-secondary" style={{ fontSize: 13 }}>
              {t("see_all")} <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {[1,2,3].map(i => (
                <div key={i} className="card" style={{ height: 320 }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: "50%" }} />
                    <div className="skeleton" style={{ height: 18 }} />
                    <div className="skeleton" style={{ height: 12, width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p>{t("no_courses")}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} delay={Math.min(i + 1, 5)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section">
        <div className="container">
          <div style={{
            background: "var(--accent)", borderRadius: 18,
            padding: "clamp(40px, 6vw, 72px)", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -60, right: -60, width: 300, height: 300,
              borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none",
            }} />
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "white", marginBottom: 16 }}>
              {t("cta_title")}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
              {t("cta_desc")}
            </p>
            <Link href="/register" className="btn" style={{
              background: "white", color: "var(--accent)", fontSize: 15, padding: "13px 32px", fontWeight: 700,
            }}>
              {t("cta_btn")} <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 0", background: "var(--bg-secondary)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={14} color="white" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>EduFlow</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>© 2024 EduFlow. {t("rights")}</p>
        </div>
      </footer>
    </div>
  );
}
