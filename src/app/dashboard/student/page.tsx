"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen, Award, CheckCircle, TrendingUp, Sparkles,
  ChevronRight, ArrowRight, Play, Target, BarChart2,
  LayoutDashboard, GraduationCap, CreditCard, User,
  XCircle, AlertCircle, X, ChevronDown, ChevronUp
} from "lucide-react";
import { CircularProgress, Confetti } from "@/components/ui/Progress";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { StatCardSkeleton } from "@/components/ui/Skeletons";
import BottomTabNav from "@/components/ui/BottomTabNav";;

type NavSection = "overview" | "courses" | "quizzes" | "certificates" | "progress";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [confetti, setConfetti] = useState(false);

  // Wrong answers modal
  const [wrongModal, setWrongModal] = useState<any | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [wrongLoading, setWrongLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number[]>([]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "STUDENT") { router.push("/dashboard/teacher"); return; }

    Promise.all([
      api.get("/api/enrollments/my").catch(() => ({ data: [] })),
      api.get("/api/certificates/my").catch(() => ({ data: [] })),
      api.get("/api/submissions/my").catch(() => ({ data: [] })),
      api.get("/api/progress/my").catch(() => ({ data: [] })),
    ]).then(([e, c, s, p]) => {
      setEnrollments(e.data);
      setCertificates(c.data);
      setSubmissions(s.data);
      setProgress(p.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const openWrongAnswers = async (submission: any) => {
    setWrongModal(submission);
    setExpandedQ([]);
    setWrongLoading(true);

    // If submission already has answers array embedded, use directly
    if (Array.isArray(submission.answers) && submission.answers.length > 0) {
      const wrong = submission.answers.filter((a: any) => !a.correct);
      setWrongAnswers(wrong);
      setWrongLoading(false);
      return;
    }

    // Otherwise fetch from API
    try {
      const r = await api.get(`/api/submissions/${submission.id}/answers`);
      const data = Array.isArray(r.data) ? r.data : (r.data.answers || r.data.questionResults || []);
      const wrong = data.filter((a: any) => !a.correct);
      setWrongAnswers(wrong);
    } catch {
      // Second attempt: try quiz result endpoint
      try {
        const r2 = await api.get(`/api/submissions/${submission.id}`);
        const data2 = r2.data.answers || r2.data.questionResults || [];
        const wrong2 = data2.filter((a: any) => !a.correct);
        setWrongAnswers(wrong2);
      } catch {
        // Last resort: check sessionStorage cache from quiz solve page
        try {
          const cached = JSON.parse(sessionStorage.getItem("quizResults") || "{}");
          const cachedResult = Object.values(cached).find((v: any) =>
            v.submissionId === submission.id || v.id === submission.id || v.quizId === submission.quizId
          ) as any;
          if (cachedResult?.answers) {
            setWrongAnswers(cachedResult.answers.filter((a: any) => !a.correct));
          } else {
            setWrongAnswers([]);
          }
        } catch {
          setWrongAnswers([]);
        }
      }
    } finally {
      setWrongLoading(false);
    }
  };

  const passedQuizzes = submissions.filter((s: any) => s.passed).length;
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((a: number, s: any) => a + s.percentage, 0) / submissions.length)
    : 0;
  const completedLessons = progress.filter((p: any) => p.completed).length;

  if (!user) return null;

  const navItems: { id: NavSection; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "İcmal", icon: LayoutDashboard },
    { id: "courses", label: "Kurslarım", icon: BookOpen, badge: enrollments.length },
    { id: "quizzes", label: "Quiz Nəticələri", icon: Target, badge: submissions.length },
    { id: "certificates", label: "Sertifikatlar", icon: Award, badge: certificates.length },
    { id: "progress", label: "Tərəqqi", icon: TrendingUp },
  ];

  const stats = [
    { icon: BookOpen, value: enrollments.length, label: "Qeydiyyatlı kurs", color: "var(--accent)" },
    { icon: CheckCircle, value: completedLessons, label: "Tamamlanan dərs", color: "#16a34a" },
    { icon: Target, value: passedQuizzes, label: "Keçilmiş quiz", color: "#7c3aed" },
    { icon: BarChart2, value: `${avgScore}%`, label: "Ortalama bal", color: "#0ea5e9" },
    { icon: Award, value: certificates.length, label: "Sertifikat", color: "#f59e0b" },
  ];

  return (
    <div className="page" style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <OnboardingModal />
      <Confetti trigger={confetti} onDone={() => setConfetti(false)} />
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 250,
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          {/* User info */}
          <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif", flexShrink: 0,
              }}>
                {user.fullName[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.fullName}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "10px 10px", flex: 1 }}>
            {navItems.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 9, marginBottom: 2,
                  background: activeSection === id ? "var(--accent-soft)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  color: activeSection === id ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: activeSection === id ? 600 : 400,
                  fontSize: 14, transition: "all 0.15s ease",
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 100,
                    background: activeSection === id ? "var(--accent)" : "var(--bg-secondary)",
                    color: activeSection === id ? "white" : "var(--text-muted)",
                    minWidth: 18, textAlign: "center",
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick links */}
          <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/courses" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 8, textDecoration: "none", fontSize: 13,
              color: "var(--text-secondary)", background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}>
              <BookOpen size={13} color="var(--accent)" /> Kursları kəşf et
            </Link>
            <Link href="/payments" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 8, textDecoration: "none", fontSize: 13,
              color: "var(--text-secondary)", background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}>
              <CreditCard size={13} color="var(--accent)" /> Ödənişlər
            </Link>
            <Link href="/ai-tutor" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 8, textDecoration: "none", fontSize: 13,
              color: "white", background: "var(--accent)",
            }}>
              <Sparkles size={13} /> AI Tutor
            </Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4 }}>Xoş gəldiniz, {user.fullName.split(" ")[0]}! 👋</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Tərəqqinizə ümumi baxış</p>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
                {loading ? (
                  [1,2,3,4,5].map(i => <StatCardSkeleton key={i} />)
                ) : stats.map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>{value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent courses */}
              {enrollments.length > 0 && (
                <div className="card" style={{ padding: 22, marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15 }}>Son kurslar</h3>
                    <button onClick={() => setActiveSection("courses")} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>Hamısı</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {enrollments.slice(0, 3).map((e: any) => (
                      <Link key={e.id} href={`/courses/${e.courseId}`} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 9,
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        textDecoration: "none",
                      }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen size={15} color="var(--accent)" />
                        </div>
                        <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{e.courseTitle}</p>
                        <ChevronRight size={14} color="var(--text-muted)" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent quiz results */}
              {submissions.length > 0 && (
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15 }}>Son quiz nəticələri</h3>
                    <button onClick={() => setActiveSection("quizzes")} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>Hamısı</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {submissions.slice(0, 3).map((s: any) => (
                      <div key={s.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px", borderRadius: 9,
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: s.passed ? "#dcfce7" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {s.passed ? <CheckCircle size={14} color="#16a34a" /> : <XCircle size={14} color="#dc2626" />}
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.quizTitle}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: s.passed ? "#16a34a" : "#dc2626", fontFamily: "Syne, sans-serif" }}>
                            {Math.round(s.percentage)}%
                          </span>
                          {!s.passed && (
                            <button
                              onClick={() => openWrongAnswers(s)}
                              style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", cursor: "pointer" }}
                            >
                              Səhvlər
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COURSES ── */}
          {activeSection === "courses" && (
            <div className="animate-fade-up">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, marginBottom: 4 }}>Kurslarım</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{enrollments.length} kursa qoşulmusunuz</p>
                </div>
                <Link href="/courses" className="btn btn-primary" style={{ fontSize: 13 }}>
                  <ArrowRight size={14} /> Yeni kurs
                </Link>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 78 }} />)}
                </div>
              ) : enrollments.length === 0 ? (
                <div className="card" style={{ padding: "56px", textAlign: "center" }}>
                  <BookOpen size={40} style={{ margin: "0 auto 14px", opacity: 0.2, color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Hələ heç bir kursa qoşulmamısınız</p>
                  <Link href="/courses" className="btn btn-primary" style={{ fontSize: 13 }}>Kursları kəşf et</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {enrollments.map((e: any) => (
                    <Link key={e.id} href={`/courses/${e.courseId}`} className="card" style={{
                      padding: "16px 20px", textDecoration: "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen size={18} color="var(--accent)" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{e.courseTitle}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(e.enrolledAt).toLocaleDateString("az-AZ")}</span>
                            <span style={{
                              fontSize: 11, padding: "2px 7px", borderRadius: 100,
                              background: e.accessMethod === "FREE" ? "#dcfce7" : e.accessMethod === "CODE" ? "#ede9fe" : "#dbeafe",
                              color: e.accessMethod === "FREE" ? "#15803d" : e.accessMethod === "CODE" ? "#7c3aed" : "#1d4ed8",
                            }}>
                              {e.accessMethod === "FREE" ? "Pulsuz" : e.accessMethod === "CODE" ? "Kodla" : "Ödənişli"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}>
                          <Play size={12} /> Davam et
                        </span>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── QUIZZES ── */}
          {activeSection === "quizzes" && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4 }}>Quiz Nəticələri</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  {passedQuizzes} keçdiniz · {submissions.length - passedQuizzes} keçmediniz
                </p>
              </div>

              {submissions.length === 0 ? (
                <div className="card" style={{ padding: "56px", textAlign: "center" }}>
                  <Target size={40} style={{ margin: "0 auto 14px", opacity: 0.2, color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)" }}>Hələ heç bir quiz həll etməmisiniz</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {submissions.map((s: any) => (
                    <div key={s.id} className="card" style={{
                      padding: "16px 20px",
                      borderLeft: `3px solid ${s.passed ? "#16a34a" : "#dc2626"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: s.passed ? "#dcfce7" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {s.passed ? <CheckCircle size={18} color="#16a34a" /> : <XCircle size={18} color="#dc2626" />}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{s.quizTitle}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {new Date(s.completedAt).toLocaleDateString("az-AZ")}
                              </span>
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                Cəhd #{s.attemptNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 20, fontWeight: 800, color: s.passed ? "#16a34a" : "#dc2626", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                              {Math.round(s.percentage)}%
                            </p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.score}/{s.maxScore} bal</p>
                          </div>

                          {/* Wrong answers button */}
                          <button
                            onClick={() => openWrongAnswers(s)}
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              fontSize: 12, padding: "7px 12px", borderRadius: 8,
                              background: s.passed ? "var(--bg-secondary)" : "#fef2f2",
                              color: s.passed ? "var(--text-secondary)" : "#dc2626",
                              border: `1px solid ${s.passed ? "var(--border)" : "#fca5a5"}`,
                              cursor: "pointer",
                            }}
                          >
                            <AlertCircle size={13} />
                            Səhv cavablar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CERTIFICATES ── */}
          {activeSection === "certificates" && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4 }}>Sertifikatlar</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{certificates.length} sertifikat qazanmısınız</p>
              </div>

              {certificates.length === 0 ? (
                <div className="card" style={{ padding: "56px", textAlign: "center" }}>
                  <Award size={44} style={{ margin: "0 auto 14px", opacity: 0.2, color: "#f59e0b" }} />
                  <p style={{ color: "var(--text-secondary)", marginBottom: 8 }}>Hələ sertifikat yoxdur</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Kursları tamamlayaraq sertifikat qazanın</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                  {certificates.map((c: any) => (
                    <div key={c.id} className="card" style={{ padding: 22, borderTop: "3px solid #f59e0b" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                        <Award size={20} color="#d97706" />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{c.courseTitle}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{c.teacherName}</p>
                      <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: 6, display: "inline-block" }}>
                        {c.certificateNumber}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
                        {new Date(c.issuedAt).toLocaleDateString("az-AZ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROGRESS ── */}
          {activeSection === "progress" && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4 }}>Tərəqqi</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Öyrənmə fəaliyyətinizin icmalı</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Tamamlanan dərslər", value: progress.length > 0 ? Math.round((completedLessons / progress.length) * 100) : 0, color: "#16a34a", sub: `${completedLessons}/${progress.length}` },
                  { label: "Keçilən quizlər", value: submissions.length > 0 ? Math.round((passedQuizzes / submissions.length) * 100) : 0, color: "#7c3aed", sub: `${passedQuizzes}/${submissions.length}` },
                  { label: "Ortalama quiz balı", value: avgScore, color: "#0ea5e9", sub: `${avgScore}%` },
                ].map(({ label, value, color, sub }) => (
                  <div key={label} className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
                    <CircularProgress value={value} size={90} strokeWidth={8} color={color} />
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4, lineHeight: 1.4 }}>{label}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "Syne, sans-serif", color }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enrollment progress */}
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Kurs tərəqqisi</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {enrollments.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Heç bir kursa qeydiyyat yoxdur</p>
                ) : enrollments.map((enr: any) => {
                  const courseLessons = progress.filter((p: any) => p.courseId === enr.courseId || p.course?.id === enr.courseId);
                  const done = courseLessons.filter((p: any) => p.completed).length;
                  const total = courseLessons.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={enr.id} className="card" style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <CircularProgress value={pct} size={56} strokeWidth={5} color="var(--accent)" animate={false} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{enr.courseTitle || enr.course?.title || "Kurs"}</p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{done}/{total} dərs tamamlandı</p>
                        </div>
                        {pct === 100 && (
                          <button
                            onClick={() => setConfetti(true)}
                            style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer" }}
                            title="Təbrik et!"
                          >🎉</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── WRONG ANSWERS MODAL ── */}
      {wrongModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) setWrongModal(null); }}
        >
          <div className="card" style={{ width: "100%", maxWidth: 580, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <XCircle size={20} color="#dc2626" /> Səhv Cavablar
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{wrongModal.quizTitle}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "Syne, sans-serif", color: wrongModal.passed ? "#16a34a" : "#dc2626" }}>
                  {Math.round(wrongModal.percentage)}%
                </span>
                <button onClick={() => setWrongModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
              {wrongLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 80 }} />)}
                </div>
              ) : wrongAnswers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <CheckCircle size={44} color="#16a34a" style={{ margin: "0 auto 14px" }} />
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                    {wrongModal.passed ? "Bütün sualları düzgün cavabladınız!" : "Detallar yüklənəmədi"}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {wrongModal.passed ? "Əla iş!" : "API bu submission üçün cavab detalları qaytarmadı"}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                    {wrongAnswers.length} səhv cavab tapıldı
                  </p>
                  {wrongAnswers.map((a: any, i: number) => {
                    const open = expandedQ.includes(i);
                    return (
                      <div key={i} className="card" style={{ borderLeft: "3px solid #dc2626", overflow: "hidden" }}>
                        <button
                          onClick={() => setExpandedQ(prev => open ? prev.filter(x => x !== i) : [...prev, i])}
                          style={{
                            width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
                            padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                          }}
                        >
                          <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                          <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                            {a.questionText}
                          </p>
                          {open ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                        </button>

                        {open && (
                          <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ padding: "8px 12px", borderRadius: 8, background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "#15803d", marginBottom: 2 }}>✓ Düzgün cavab</p>
                              <p style={{ fontSize: 13, color: "#15803d" }}>{a.correctAnswer}</p>
                            </div>
                            {a.givenAnswer && (
                              <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", marginBottom: 2 }}>✗ Sizin cavabınız</p>
                                <p style={{ fontSize: 13, color: "#dc2626" }}>{a.givenAnswer}</p>
                              </div>
                            )}
                            {a.explanation && (
                              <div style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-secondary)", borderLeft: "3px solid var(--accent)" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 2 }}>💡 İzah</p>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{a.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => setWrongModal(null)} className="btn btn-secondary" style={{ fontSize: 13 }}>
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <BottomTabNav
        items={navItems}
        active={activeSection}
        onChange={(id) => setActiveSection(id as NavSection)}
      />
    </div>
  );
}
