"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen, Award, CheckCircle, TrendingUp, Sparkles,
  ChevronRight, ArrowRight, Play, Clock, Target, BarChart2
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const passedQuizzes = submissions.filter((s: any) => s.passed).length;
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((a: number, s: any) => a + s.percentage, 0) / submissions.length)
    : 0;
  const completedLessons = progress.filter((p: any) => p.completed).length;

  if (!user) return null;

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container">
          <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, background: "var(--accent)", borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif",
            }}>
              {user.fullName[0]}
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>Xoş gəldiniz 👋</p>
              <h1 style={{ fontSize: 26 }}>{user.fullName}</h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">

          {/* Stats */}
          <div className="animate-fade-up" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14, marginBottom: 36,
          }}>
            {[
              { icon: BookOpen, value: loading ? "—" : enrollments.length, label: "Qeydiyyatlı kurs", color: "var(--accent)" },
              { icon: CheckCircle, value: loading ? "—" : completedLessons, label: "Tamamlanan dərs", color: "#16a34a" },
              { icon: Target, value: loading ? "—" : passedQuizzes, label: "Keçilmiş quiz", color: "#7c3aed" },
              { icon: BarChart2, value: loading ? "—" : `${avgScore}%`, label: "Ortalama bal", color: "#0ea5e9" },
              { icon: Award, value: loading ? "—" : certificates.length, label: "Sertifikat", color: "#f59e0b" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={19} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

            {/* Enrollments */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 19 }}>Kurslarım</h2>
                <Link href="/courses" className="btn btn-secondary" style={{ fontSize: 12, padding: "7px 14px" }}>
                  Yeni kurs <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 78 }} />)}
                </div>
              ) : enrollments.length === 0 ? (
                <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                  <BookOpen size={40} style={{ margin: "0 auto 14px", opacity: 0.25, color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Hələ heç bir kursa qoşulmamısınız</p>
                  <Link href="/courses" className="btn btn-primary" style={{ fontSize: 13 }}>
                    Kursları kəşf et
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {enrollments.map((e: any) => {
                    const courseProgress = progress.filter((p: any) =>
                      p.courseId === e.courseId
                    );
                    return (
                      <Link key={e.id} href={`/courses/${e.courseId}`} className="card" style={{
                        padding: "16px 20px", textDecoration: "none",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 11,
                            background: "var(--accent-soft)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <BookOpen size={18} color="var(--accent)" />
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                              {e.courseTitle}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {new Date(e.enrolledAt).toLocaleDateString("az-AZ")}
                              </span>
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
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Link href={`/courses/${e.courseId}`} className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}
                            onClick={ev => ev.stopPropagation()}>
                            <Play size={12} /> Davam et
                          </Link>
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Recent submissions */}
              {submissions.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <h2 style={{ fontSize: 19, marginBottom: 16 }}>Son quiz nəticələri</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {submissions.slice(0, 5).map((s: any) => (
                      <div key={s.id} className="card" style={{
                        padding: "14px 18px", display: "flex",
                        alignItems: "center", justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: s.passed ? "#dcfce7" : "#fef2f2",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {s.passed
                              ? <CheckCircle size={16} color="#16a34a" />
                              : <Target size={16} color="#ef4444" />}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.quizTitle}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                              {new Date(s.completedAt).toLocaleDateString("az-AZ")}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 16, fontWeight: 700, color: s.passed ? "#16a34a" : "#ef4444", fontFamily: "Syne, sans-serif" }}>
                            {Math.round(s.percentage)}%
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.score}/{s.maxScore} bal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Certificates */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
                    <Award size={17} color="#f59e0b" /> Sertifikatlar
                  </h3>
                  {certificates.length > 0 && (
                    <Link href="/certificates" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                      Hamısı
                    </Link>
                  )}
                </div>
                {certificates.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                    Hələ sertifikat yoxdur
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {certificates.slice(0, 3).map((c: any) => (
                      <div key={c.id} style={{
                        padding: "10px 12px", background: "var(--bg-secondary)",
                        borderRadius: 8, border: "1px solid var(--border)",
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.courseTitle}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.certificateNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress summary */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <TrendingUp size={17} color="var(--accent)" /> Ümumi progress
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Tamamlanan dərslər", value: completedLessons, total: progress.length, color: "#16a34a" },
                    { label: "Keçilən quizlər", value: passedQuizzes, total: submissions.length, color: "#7c3aed" },
                  ].map(({ label, value, total, color }) => {
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 5 }}>
                          <span>{label}</span>
                          <span style={{ fontWeight: 600 }}>{value}/{total}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 99, background: "var(--border)" }}>
                          <div style={{ height: "100%", borderRadius: 99, background: color, width: `${pct}%`, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Tutor CTA */}
              <div style={{
                padding: 20,
                background: "linear-gradient(135deg, var(--accent), #e8741a)",
                borderRadius: "var(--radius)", color: "white",
              }}>
                <Sparkles size={20} style={{ marginBottom: 10 }} />
                <h3 style={{ fontSize: 15, marginBottom: 6, fontFamily: "Syne, sans-serif" }}>AI Tutor</h3>
                <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>
                  Hər hansı mövzunu anlamadıqda AI tutordan kömək alın.
                </p>
                <Link href="/ai-tutor" className="btn" style={{
                  background: "rgba(255,255,255,0.2)", color: "white",
                  fontSize: 13, padding: "8px 16px",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}>
                  Başla <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
