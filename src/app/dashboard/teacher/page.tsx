"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import {
  BookOpen, Users, Plus, Eye, EyeOff, ArrowRight, Edit, Trash2, AlertTriangle,
  Sparkles, ChevronRight, ClipboardCheck, Key, X, GraduationCap,
  Calendar, TrendingUp,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const toast = useToastStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // enrollment counts per courseId
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<number, number>>({});
  // students modal state
  const [studentsModal, setStudentsModal] = useState<{ courseId: number; title: string } | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  // delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ courseId: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "TEACHER") { router.push("/dashboard/student"); return; }

    api.get("/api/courses/my")
      .then(async r => {
        setCourses(r.data);
        // fetch enrollment counts for each course
        const counts: Record<number, number> = {};
        await Promise.all(
          (r.data as any[]).map((c: any) =>
            api.get(`/api/enrollments/course/${c.id}`)
              .then(er => { counts[c.id] = Array.isArray(er.data) ? er.data.length : 0; })
              .catch(() => { counts[c.id] = 0; })
          )
        );
        setEnrollmentCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const togglePublish = async (courseId: number, published: boolean) => {
    const endpoint = published ? "unpublish" : "publish";
    try {
      await api.put(`/api/courses/${courseId}/${endpoint}`);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, published: !published } : c));
      toast.success(published ? "Kurs gizlədildi" : "Kurs yayımlandı");
    } catch {
      toast.error("Əməliyyat uğursuz oldu");
    }
  };


  const deleteCourse = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/api/courses/${deleteConfirm.courseId}`);
      setCourses(prev => prev.filter(c => c.id !== deleteConfirm.courseId));
      toast.success("Kurs silindi");
      setDeleteConfirm(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Kurs silinə bilmədi");
    } finally {
      setDeleting(false);
    }
  };

  const openStudents = async (courseId: number, title: string) => {
    setStudentsModal({ courseId, title });
    setStudents([]);
    setStudentsLoading(true);
    try {
      const r = await api.get(`/api/enrollments/course/${courseId}`);
      setStudents(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error("Şagird siyahısı yüklənmədi");
    } finally {
      setStudentsLoading(false);
    }
  };

  const publishedCount = courses.filter(c => c.published).length;
  const draftCount = courses.filter(c => !c.published).length;
  const totalStudents = Object.values(enrollmentCounts).reduce((a, b) => a + b, 0);

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
              { icon: Edit, value: draftCount, label: "Qaralama", color: "var(--warning, #d97706)" },
              { icon: Users, value: loading ? "..." : totalStudents, label: "Ümumi şagird", color: "var(--accent-2)" },
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
                  {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 90 }} />)}
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
                    <div key={course.id} className="card" style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                          background: "var(--accent-soft)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <BookOpen size={18} color="var(--accent)" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <Link href={`/dashboard/teacher/courses/${course.id}`} style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none" }}>
                              {course.title}
                            </Link>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, flexShrink: 0,
                              background: course.published ? "#dcfce7" : "#fef3c7",
                              color: course.published ? "#15803d" : "#92400e",
                            }}>
                              {course.published ? "Yayımlanmış" : "Qaralama"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {course.accessType === "FREE" ? "Pulsuz" : course.accessType === "PAID" ? `${course.price} AZN` : "Kodla"}
                              {" · "}
                              {course.sections?.length || 0} bölmə
                            </p>
                            {/* Student count badge */}
                            <button
                              onClick={() => openStudents(course.id, course.title)}
                              style={{
                                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                                borderRadius: 100, padding: "2px 10px",
                                display: "flex", alignItems: "center", gap: 5,
                                cursor: "pointer", fontSize: 12, color: "var(--text-secondary)",
                              }}
                            >
                              <Users size={11} color="var(--accent)" />
                              {enrollmentCounts[course.id] ?? "..."} şagird
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
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
                          <button
                            onClick={() => setDeleteConfirm({ courseId: course.id, title: course.title })}
                            className="btn"
                            style={{ fontSize: 12, padding: "6px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}
                            title="Kursu sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
                      textDecoration: "none", color: "var(--text-primary)",
                      fontSize: 13, fontWeight: 500,
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

      {/* Students Modal */}
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1001,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={22} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, color: "var(--text-primary)" }}>Kursu sil</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Bu əməliyyat geri qaytarıla bilməz</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm.title}</strong> kursunu silmək istədiyinizə əminsiniz?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary" style={{ fontSize: 14 }} disabled={deleting}>
                Ləğv et
              </button>
              <button onClick={deleteCourse} disabled={deleting} style={{
                fontSize: 14, padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#dc2626", color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
                opacity: deleting ? 0.7 : 1,
              }}>
                {deleting ? "Silinir..." : <><Trash2 size={14} /> Sil</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {studentsModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) setStudentsModal(null); }}
        >
          <div className="card" style={{ width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <GraduationCap size={20} color="var(--accent)" /> Şagirdlər
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{studentsModal.title}</p>
              </div>
              <button onClick={() => setStudentsModal(null)} className="btn btn-ghost" style={{ padding: 8 }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
              {studentsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
                </div>
              ) : students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  <Users size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <p>Bu kursa hələ şagird qoşulmayıb</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                    Cəmi {students.length} şagird
                  </p>
                  {students.map((s: any, i: number) => (
                    <div key={s.id || i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      background: "var(--bg-secondary)",
                      borderRadius: 10, border: "1px solid var(--border)",
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif",
                      }}>
                        {(s.studentName || s.fullName || "?")[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.studentName || s.fullName || "İsimsiz şagird"}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                          <Calendar size={11} />
                          {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString("az-AZ") : "—"}
                          {s.accessMethod && ` · ${s.accessMethod}`}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
                        background: s.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
                        color: s.status === "ACTIVE" ? "#15803d" : "#92400e",
                        flexShrink: 0,
                      }}>
                        {s.status === "ACTIVE" ? "Aktiv" : s.status || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
