"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen, Play, Lock, ChevronDown, ChevronRight,
  Award, Clock, Users, CheckCircle, ArrowLeft, Zap, Key
} from "lucide-react";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/courses/public/${id}`)
      .then(r => setCourse(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user) {
      api.get("/api/enrollments/my")
        .then(r => {
          const isEnrolled = r.data.some((e: any) => e.courseId === Number(id));
          setEnrolled(isEnrolled);
        })
        .catch(() => {});
    }
  }, [id, user]);

  const enrollFree = async () => {
    if (!user) { router.push("/login"); return; }
    setEnrolling(true);
    try {
      await api.post(`/api/enrollments/free/${id}`);
      setEnrolled(true);
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setEnrolling(false);
    }
  };

  const enrollWithCode = async () => {
    if (!user) { router.push("/login"); return; }
    if (!accessCode.trim()) return;
    setEnrolling(true);
    setError("");
    try {
      await api.post("/api/enrollments/code", { accessCode });
      setEnrolled(true);
      setShowCodeInput(false);
    } catch (e: any) {
      setError(e.response?.data?.error || "Kod yanlışdır");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (i: number) => {
    setOpenSections(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skeleton" style={{ height: 40, width: "70%" }} />
            <div className="skeleton" style={{ height: 20, width: "40%" }} />
            <div className="skeleton" style={{ height: 120 }} />
          </div>
          <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  );

  if (!course) return (
    <div className="page" style={{ paddingTop: 120, textAlign: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Kurs tapılmadı</p>
    </div>
  );

  const totalLessons = course.sections?.reduce((a: number, s: any) => a + (s.lessons?.length || 0), 0) || 0;

  const accessBadge = {
    FREE: { label: "Pulsuz", className: "badge-free" },
    PAID: { label: `${course.price} AZN`, className: "badge-paid" },
    CODE_REQUIRED: { label: "Kodla giriş", className: "badge-code" },
  }[course.accessType as string] || { label: "", className: "" };

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "48px 0" }}>
        <div className="container">
          <Link href="/courses" className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 12px", marginBottom: 24, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Kurslara qayıt
          </Link>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <span className={`badge ${accessBadge.className}`}>{accessBadge.label}</span>
                {course.published && <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>Aktiv</span>}
              </div>
              <h1 className="animate-fade-up" style={{ fontSize: "clamp(26px, 4vw, 42px)", marginBottom: 16, lineHeight: 1.15 }}>
                {course.title}
              </h1>
              <p className="animate-fade-up delay-1" style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
                {course.description}
              </p>
              <div className="animate-fade-up delay-2" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { icon: Users, text: course.teacherName, label: "Müəllim" },
                  { icon: BookOpen, text: `${course.sections?.length || 0} bölmə`, label: "" },
                  { icon: Play, text: `${totalLessons} dərs`, label: "" },
                ].map(({ icon: Icon, text, label }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
                    <Icon size={16} color="var(--accent)" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll Card */}
            <div className="card animate-fade-up delay-2" style={{ padding: 28, position: "sticky", top: 80 }}>
              {course.thumbnailUrl ? (
                <div style={{ height: 160, borderRadius: 10, background: `url(${course.thumbnailUrl}) center/cover`, marginBottom: 20 }} />
              ) : (
                <div style={{ height: 160, borderRadius: 10, background: "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={40} color="var(--accent)" style={{ opacity: 0.4 }} />
                </div>
              )}

              {enrolled ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--success)", marginBottom: 16, fontWeight: 600 }}>
                    <CheckCircle size={20} /> Qeydiyyatlısınız
                  </div>
                  {course.sections?.[0]?.lessons?.[0] && (
                    <Link href={`/learn/${course.sections[0].lessons[0].id}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      <Play size={16} /> Dərslərə başla
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  {course.accessType === "FREE" && (
                    <button onClick={enrollFree} disabled={enrolling} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
                      {enrolling ? "..." : <><Zap size={16} /> Pulsuz qoşul</>}
                    </button>
                  )}

                  {course.accessType === "CODE_REQUIRED" && (
                    <div>
                      {!showCodeInput ? (
                        <button onClick={() => setShowCodeInput(true)} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
                          <Key size={16} /> Kod ilə qoşul
                        </button>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                          <input
                            className="input"
                            placeholder="Giriş kodunu daxil et..."
                            value={accessCode}
                            onChange={e => setAccessCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === "Enter" && enrollWithCode()}
                          />
                          <button onClick={enrollWithCode} disabled={enrolling} className="btn btn-primary" style={{ justifyContent: "center" }}>
                            {enrolling ? "Yoxlanır..." : "Kodu tətbiq et"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {course.accessType === "PAID" && (
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
                      <Award size={16} /> {course.price} AZN — Satın al
                    </button>
                  )}

                  {error && <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center" }}>{error}</p>}

                  {!user && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                      Qoşulmaq üçün <Link href="/login" style={{ color: "var(--accent)" }}>daxil ol</Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 24, marginBottom: 24 }}>Kurs proqramı</h2>
          {course.sections?.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <BookOpen size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p>Hələ dərs əlavə edilməyib</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {course.sections?.map((section: any, i: number) => (
                <div key={section.id} className="card" style={{ overflow: "hidden" }}>
                  <button
                    onClick={() => toggleSection(i)}
                    style={{
                      width: "100%", padding: "18px 20px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "var(--accent-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "var(--accent)",
                        fontFamily: "Syne, sans-serif",
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{section.title}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{section.lessons?.length || 0} dərs</p>
                      </div>
                    </div>
                    {openSections.includes(i) ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  </button>

                  {openSections.includes(i) && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {section.lessons?.map((lesson: any, li: number) => (
                        <div key={lesson.id} style={{
                          padding: "14px 20px 14px 64px",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          borderBottom: li < section.lessons.length - 1 ? "1px solid var(--border)" : "none",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {enrolled
                              ? <Play size={14} color="var(--accent)" />
                              : <Lock size={14} color="var(--text-muted)" />
                            }
                            <span style={{ fontSize: 14, color: enrolled ? "var(--text-primary)" : "var(--text-secondary)" }}>
                              {lesson.title}
                            </span>
                          </div>
                          {enrolled && (
                            <Link href={`/learn/${lesson.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}>
                              İzlə
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
