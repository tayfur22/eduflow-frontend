"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, Award, CheckCircle, Clock, ArrowRight, GraduationCap, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "STUDENT") { router.push("/dashboard/teacher"); return; }

    Promise.all([
      api.get("/api/enrollments/my").catch(() => ({ data: [] })),
      api.get("/api/certificates/my").catch(() => ({ data: [] })),
      api.get("/api/submissions/my").catch(() => ({ data: [] })),
    ]).then(([e, c, s]) => {
      setEnrollments(e.data);
      setCertificates(c.data);
      setSubmissions(s.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const passedQuizzes = submissions.filter(s => s.passed).length;
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((a, s) => a + s.percentage, 0) / submissions.length)
    : 0;

  if (!user) return null;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container">
          <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56,
              background: "var(--accent)",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "white",
              fontFamily: "Syne, sans-serif",
            }}>
              {user.fullName[0]}
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>Xoş gəldiniz 👋</p>
              <h1 style={{ fontSize: 26 }}>{user.fullName}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Stats */}
          <div className="animate-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { icon: BookOpen, value: enrollments.length, label: "Qeydiyyatlı kurs", color: "var(--accent)" },
              { icon: CheckCircle, value: passedQuizzes, label: "Keçilmiş quiz", color: "var(--success)" },
              { icon: Award, value: certificates.length, label: "Sertifikat", color: "#7c3aed" },
              { icon: TrendingUp, value: `${avgScore}%`, label: "Ortalama bal", color: "var(--accent-2)" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            {/* Enrollments */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20 }}>Kurslarım</h2>
                <Link href="/courses" className="btn btn-secondary" style={{ fontSize: 12, padding: "7px 14px" }}>
                  Yeni kurs <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 80 }} />)}
                </div>
              ) : enrollments.length === 0 ? (
                <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                  <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.3, color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Hələ heç bir kursa qoşulmamısınız</p>
                  <Link href="/courses" className="btn btn-primary" style={{ fontSize: 13 }}>
                    Kursları kəşf et
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {enrollments.map(e => (
                    <Link key={e.id} href={`/courses/${e.courseId}`} className="card" style={{
                      padding: "16px 20px",
                      textDecoration: "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: "var(--accent-soft)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <BookOpen size={18} color="var(--accent)" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{e.courseTitle}</p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {new Date(e.enrolledAt).toLocaleDateString("az-AZ")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Certificates */}
              <div className="card" style={{ padding: "20px" }}>
                <h3 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={18} color="#7c3aed" /> Sertifikatlar
                </h3>
                {certificates.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                    Hələ sertifikat yoxdur
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {certificates.slice(0, 3).map(c => (
                      <div key={c.id} style={{
                        padding: "10px 12px",
                        background: "var(--bg-secondary)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.courseTitle}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.certificateNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Tutor CTA */}
              <div style={{
                padding: "20px",
                background: "linear-gradient(135deg, var(--accent), #e8741a)",
                borderRadius: "var(--radius)",
                color: "white",
              }}>
                <Sparkles size={20} style={{ marginBottom: 10 }} />
                <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: "Syne, sans-serif" }}>
                  AI Tutor
                </h3>
                <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>
                  Hər hansı mövzunu anlamadığınızda AI tutordan kömək alın.
                </p>
                <Link href="/ai-tutor" className="btn" style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 13,
                  padding: "8px 16px",
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
