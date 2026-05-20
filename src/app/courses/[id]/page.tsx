"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen, Play, Lock, ChevronDown, ChevronRight,
  Award, Users, CheckCircle, ArrowLeft, Zap, Key,
  Clock, DollarSign, Loader2, AlertCircle, GraduationCap
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
  const [showPayment, setShowPayment] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [error, setError] = useState("");
  const toast = useToastStore();
  const [success, setSuccess] = useState("");
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/api/courses/public/${id}`)
      .then(r => {
        setCourse(r.data);
        // Quiz-ləri yüklə
        api.get(`/api/courses/${id}/quizzes`).then(qr => setQuizzes(qr.data)).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user) {
      api.get("/api/enrollments/my")
        .then(r => {
          setEnrolled(r.data.some((e: any) => e.courseId === Number(id)));
        }).catch(() => {});
    }
  }, [id, user]);

  const enrollFree = async () => {
    if (!user) { router.push("/login"); return; }
    setEnrolling(true); setError("");
    try {
      await api.post(`/api/enrollments/free/${id}`);
      setEnrolled(true);
      toast.success("Kursa uğurla qoşuldunuz! 🎉");
      setSuccess("Kursa uğurla qoşuldunuz!");
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi");
    } finally { setEnrolling(false); }
  };

  const enrollWithCode = async () => {
    if (!user) { router.push("/login"); return; }
    if (!accessCode.trim()) return;
    setEnrolling(true); setError("");
    try {
      await api.post("/api/enrollments/code", { accessCode });
      setEnrolled(true);
      toast.success("Kursa uğurla qoşuldunuz! 🎉");
      setSuccess("Kod qəbul edildi! Kursa qoşuldunuz.");
      setShowCodeInput(false);
    } catch (e: any) {
      setError(e.response?.data?.error || "Kod yanlışdır");
    } finally { setEnrolling(false); }
  };

  const enrollWithPayment = async () => {
    if (!user) { router.push("/login"); return; }
    setEnrolling(true); setError("");
    try {
      await api.post("/api/payments", {
        courseId: Number(id),
        amount: course.price,
        currency: "AZN",
      });
      setEnrolled(true);
      toast.success("Kursa uğurla qoşuldunuz! 🎉");
      setSuccess("Ödəniş qəbul edildi! Kursa qoşuldunuz.");
      setShowPayment(false);
    } catch (e: any) {
      setError(e.response?.data?.error || "Ödəniş xətası");
    } finally { setEnrolling(false); }
  };

  const toggleSection = (i: number) => {
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skeleton" style={{ height: 44, width: "70%" }} />
            <div className="skeleton" style={{ height: 18, width: "40%" }} />
            <div className="skeleton" style={{ height: 120 }} />
          </div>
          <div className="skeleton" style={{ height: 340, borderRadius: 16 }} />
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
    FREE: { label: "Pulsuz", color: "#16a34a", bg: "#dcfce7" },
    PAID: { label: `${course.price} AZN`, color: "#1d4ed8", bg: "#dbeafe" },
    CODE_REQUIRED: { label: "Kodla giriş", color: "#7c3aed", bg: "#ede9fe" },
  }[course.accessType as string] || { label: "", color: "", bg: "" };

  return (
    <div className="page" style={{ paddingTop: 80 }}>

      {/* Hero */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "48px 0" }}>
        <div className="container">
          <Link href="/courses" className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 12px", marginBottom: 24, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Kurslara qayıt
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 48, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                  background: accessBadge.bg, color: accessBadge.color,
                }}>{accessBadge.label}</span>
                {course.published && (
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)" }}>
                    Aktiv
                  </span>
                )}
              </div>

              <h1 className="animate-fade-up" style={{ fontSize: "clamp(24px, 4vw, 40px)", marginBottom: 16, lineHeight: 1.2 }}>
                {course.title}
              </h1>
              <p className="animate-fade-up delay-1" style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 28 }}>
                {course.description}
              </p>

              <div className="animate-fade-up delay-2" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { icon: GraduationCap, text: course.teacherName },
                  { icon: BookOpen, text: `${course.sections?.length || 0} bölmə` },
                  { icon: Play, text: `${totalLessons} dərs` },
                  ...(quizzes.length > 0 ? [{ icon: Award, text: `${quizzes.length} quiz` }] : []),
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-secondary)", fontSize: 14 }}>
                    <Icon size={15} color="var(--accent)" /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll Card */}
            <div className="card animate-fade-up delay-2" style={{ padding: 28, position: "sticky", top: 80 }}>
              {course.thumbnailUrl ? (
                <div style={{ height: 168, borderRadius: 10, background: `url(${course.thumbnailUrl}) center/cover`, marginBottom: 22 }} />
              ) : (
                <div style={{ height: 168, borderRadius: 10, background: "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={44} color="var(--accent)" style={{ opacity: 0.3 }} />
                </div>
              )}

              {success && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, marginBottom: 14, fontSize: 13, color: "#15803d" }}>
                  <CheckCircle size={15} /> {success}
                </div>
              )}

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 14, fontSize: 13, color: "#dc2626" }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              {enrolled ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#16a34a", marginBottom: 18, fontWeight: 600, fontSize: 15 }}>
                    <CheckCircle size={20} /> Qeydiyyatlısınız
                  </div>
                  {course.sections?.[0]?.lessons?.[0] && (
                    <Link href={`/learn/${course.sections[0].lessons[0].id}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      <Play size={15} /> Dərslərə başla
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* FREE */}
                  {course.accessType === "FREE" && (
                    <button onClick={enrollFree} disabled={enrolling} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                      {enrolling ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Zap size={16} /> Pulsuz qoşul</>}
                    </button>
                  )}

                  {/* PAID */}
                  {course.accessType === "PAID" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        onClick={() => { setShowPayment(!showPayment); setShowCodeInput(false); setError(""); }}
                        className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}
                      >
                        <DollarSign size={16} /> {course.price} AZN — Satın al
                      </button>

                      {showPayment && (
                        <div className="animate-fade-in" style={{ padding: "14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border)" }}>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                            Demo ödəniş: <strong>{course.price} AZN</strong> — Təsdiq etmək üçün düyməyə bas.
                          </p>
                          <button onClick={enrollWithPayment} disabled={enrolling} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                            {enrolling ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Ödənişi təsdiqlə"}
                          </button>
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>və ya</span>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                      </div>

                      <button
                        onClick={() => { setShowCodeInput(!showCodeInput); setShowPayment(false); setError(""); }}
                        className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}
                      >
                        <Key size={15} /> Giriş kodu ilə qoşul
                      </button>

                      {showCodeInput && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <input
                            className="input"
                            placeholder="Giriş kodunu daxil et..."
                            value={accessCode}
                            onChange={e => setAccessCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === "Enter" && enrollWithCode()}
                          />
                          <button onClick={enrollWithCode} disabled={enrolling} className="btn btn-primary" style={{ justifyContent: "center" }}>
                            {enrolling ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Kodu tətbiq et"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CODE_REQUIRED */}
                  {course.accessType === "CODE_REQUIRED" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        onClick={() => { setShowCodeInput(!showCodeInput); setError(""); }}
                        className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}
                      >
                        <Key size={16} /> Giriş kodu ilə qoşul
                      </button>
                      {showCodeInput && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <input
                            className="input"
                            placeholder="Giriş kodunu daxil et..."
                            value={accessCode}
                            onChange={e => setAccessCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === "Enter" && enrollWithCode()}
                          />
                          <button onClick={enrollWithCode} disabled={enrolling} className="btn btn-primary" style={{ justifyContent: "center" }}>
                            {enrolling ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Kodu tətbiq et"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!user && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
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
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Kurs proqramı</h2>

          {course.sections?.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <BookOpen size={36} style={{ margin: "0 auto 14px", opacity: 0.25 }} />
              <p>Hələ dərs əlavə edilməyib</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {course.sections?.map((section: any, i: number) => (
                <div key={section.id} className="card" style={{ overflow: "hidden" }}>
                  <button
                    onClick={() => toggleSection(i)}
                    style={{
                      width: "100%", padding: "16px 20px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: "var(--accent-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: "var(--accent)", fontFamily: "Syne, sans-serif",
                      }}>{i + 1}</div>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{section.title}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{section.lessons?.length || 0} dərs</p>
                      </div>
                    </div>
                    {openSections.includes(i)
                      ? <ChevronDown size={17} color="var(--text-muted)" />
                      : <ChevronRight size={17} color="var(--text-muted)" />}
                  </button>

                  {openSections.includes(i) && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {section.lessons?.map((lesson: any, li: number) => (
                        <div key={lesson.id} style={{
                          padding: "12px 20px 12px 62px",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          borderBottom: li < section.lessons.length - 1 ? "1px solid var(--border)" : "none",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {enrolled ? <Play size={13} color="var(--accent)" /> : <Lock size={13} color="var(--text-muted)" />}
                            <span style={{ fontSize: 13, color: enrolled ? "var(--text-primary)" : "var(--text-secondary)" }}>
                              {lesson.title}
                            </span>
                            {lesson.durationMinutes > 0 && (
                              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                                <Clock size={11} /> {lesson.durationMinutes} dəq
                              </span>
                            )}
                          </div>
                          {enrolled && (
                            <Link href={`/learn/${lesson.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 12px" }}>
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

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>Quizlər</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {quizzes.map((q: any) => (
                  <div key={q.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Award size={17} color="var(--accent)" />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{q.title}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {q.questionCount} sual · Keçid: {q.passingScore}%
                          {q.timeLimitMinutes > 0 && ` · ${q.timeLimitMinutes} dəq`}
                        </p>
                      </div>
                    </div>
                    {enrolled && (
                      <Link href={`/quiz/${q.id}`} className="btn btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                        Başla
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
