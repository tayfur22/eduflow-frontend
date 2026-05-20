"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen,
  Users,
  Plus,
  Eye,
  EyeOff,
  ArrowRight,
  Edit,
  Sparkles,
  ChevronRight,
  ClipboardCheck,
  Key
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "TEACHER") { router.push("/dashboard/student"); return; }
    api.get("/api/courses/my")
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const togglePublish = async (courseId: number, published: boolean) => {
    const endpoint = published ? "unpublish" : "publish";
    await api.put(`/api/courses/${courseId}/${endpoint}`);
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, published: !published } : c));
  };

  const publishedCount = courses.filter(c => c.published).length;
  const draftCount = courses.filter(c => !c.published).length;

  if (!user) return null;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56, height: 56, background: "var(--accent)", borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif",
              }}>
                {user.fullName[0]}
              </div>
              <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>Müəllim paneli</p>
                <h1 style={{ fontSize: 26 }}>{user.fullName}</h1>
              </div>
            </div>
            <Link href="/dashboard/teacher/create-course" className="btn btn-primary animate-fade-up">
              <Plus size={16} /> Yeni kurs
            </Link>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Stats */}
          <div className="animate-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { icon: BookOpen, value: courses.length, label: "Ümumi kurs", color: "var(--accent)" },
              { icon: Eye, value: publishedCount, label: "Yayımlanmış", color: "var(--success)" },
              { icon: Edit, value: draftCount, label: "Qaralama", color: "var(--warning)" },
              { icon: Users, value: "—", label: "Ümumi şagird", color: "var(--accent-2)" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>{value}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
            {/* Courses list */}
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>Kurslarım</h2>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 90 }} />)}
                </div>
              ) : courses.length === 0 ? (
                <div className="card" style={{ padding: "60px", textAlign: "center" }}>
                  <BookOpen size={44} style={{ margin: "0 auto 16px", opacity: 0.25, color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Hələ kurs yaratmamısınız</p>
                  <Link href="/dashboard/teacher/create-course" className="btn btn-primary">
                    <Plus size={15} /> İlk kursu yarat
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {courses.map(course => (
                    <div key={course.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: "var(--accent-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <BookOpen size={18} color="var(--accent)" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {course.title}
                          </p>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                            background: course.published ? "#dcfce7" : "#fef3c7",
                            color: course.published ? "#15803d" : "#92400e",
                            flexShrink: 0,
                          }}>
                            {course.published ? "Yayımlanmış" : "Qaralama"}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {course.accessType === "FREE" ? "Pulsuz" : course.accessType === "PAID" ? `${course.price} AZN` : "Kodla"}
                          {" · "}
                          {course.sections?.length || 0} bölmə
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => togglePublish(course.id, course.published)}
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                          {course.published ? <><EyeOff size={13} /> Gizlət</> : <><Eye size={13} /> Yayımla</>}
                        </button>
                        <Link href={`/dashboard/teacher/courses/${course.id}`} className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                          <Edit size={13} /> Düzəlt
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* AI tools */}
              <div style={{
                padding: "22px",
                background: "linear-gradient(135deg, var(--accent), #e8741a)",
                borderRadius: "var(--radius)",
                color: "white",
              }}>
                <Sparkles size={20} style={{ marginBottom: 10 }} />
                <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: "Syne, sans-serif" }}>AI Alətlər</h3>
                <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>
                  Mövzu yazın, AI avtomatik quiz sualları yaratsın.
                </p>
                <Link href="/dashboard/teacher/ai-quiz" className="btn" style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white", fontSize: 13, padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}>
                  AI Quiz Generator <ArrowRight size={14} />
                </Link>
              </div>

              {/* Quick actions */}
              <div className="card" style={{ padding: "20px" }}>
                <h3 style={{ fontSize: 15, marginBottom: 14 }}>Sürətli əməliyyatlar</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { href: "/dashboard/teacher/create-course", label: "Yeni kurs yarat", icon: Plus },
                    { href: "/courses", label: "Platformaya bax", icon: Eye },
                    { href: "/dashboard/teacher/quiz/create", label: "Manual Quiz yarat", icon: ClipboardCheck },
                    { href: "/dashboard/teacher/codes", label: "Giriş kodları", icon: Key },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px",
                      background: "var(--bg-secondary)",
                      borderRadius: 8, border: "1px solid var(--border)",
                      textDecoration: "none",
                      color: "var(--text-primary)",
                      fontSize: 13, fontWeight: 500,
                      transition: "all 0.18s ease",
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={14} color="var(--accent)" /> {label}
                      </span>
                      <ChevronRight size={13} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
