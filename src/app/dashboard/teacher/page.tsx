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
  Calendar, TrendingUp, LayoutDashboard, Zap, BarChart2,
} from "lucide-react";

type NavSection = "overview" | "courses" | "tools";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const toast = useToastStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<number, number>>({});
  const [studentsModal, setStudentsModal] = useState<{ courseId: number; title: string } | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ courseId: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>("overview");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "TEACHER") { router.push("/dashboard/student"); return; }

    api.get("/api/courses/my")
      .then(async r => {
        setCourses(r.data);
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

  const navItems: { id: NavSection; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "İcmal", icon: LayoutDashboard },
    { id: "courses", label: "Kurslarım", icon: BookOpen, badge: courses.length },
    { id: "tools", label: "AI & Alətlər", icon: Zap },
  ];

  return (
    <div className="page" style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg-secondary)" }}>
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
                <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 100, background: "var(--accent-soft)", color: "var(--accent)" }}>
                  Müəllim
                </span>
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

          {/* Quick actions */}
          <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/dashboard/teacher/create-course" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 8, textDecoration: "none", fontSize: 13,
              color: "white", background: "var(--accent)",
            }}>
              <Plus size={13} /> Yeni kurs yarat
            </Link>
            <Link href="/dashboard/teacher/quiz/create" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 8, textDecoration: "none", fontSize: 13,
              color: "var(--text-secondary)", background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}>
              <ClipboardCheck size={13} color="var(--accent)" /> Quiz yarat
            </Link>
            <Link href="/dashboard/teacher/codes" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 8, textDecoration: "none", fontSize: 13,
              color: "var(--text-secondary)", background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}>
              <Key size={13} color="var(--accent)" /> Giriş kodları
            </Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4 }}>Müəllim Paneli</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Xoş gəldiniz, {user.fullName.split(" ")[0]}!</p>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
                {[
                  { icon: BookOpen, value: courses.length, label: "Ümumi kurs", color: "var(--accent)" },
                  { icon: Eye, value: publishedCount, label: "Yayımlanmış", color: "#16a34a" },
                  { icon: Edit, value: draftCount, label: "Qaralama", color: "#d97706" },
                  { icon: Users, value: loading ? "…" : totalStudents, label: "Ümumi şagird", color: "#0ea5e9" },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>{value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent courses preview */}
              {courses.length > 0 && (
                <div className="card" style={{ padding: 22, marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15 }}>Son kurslar</h3>
                    <button onClick={() => setActiveSection("courses")} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>Hamısı</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {courses.slice(0, 4).map(course => (
                      <div key={course.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 9,
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                      }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen size={15} color="var(--accent)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100,
                              background: course.published ? "#dcfce7" : "#fef3c7",
                              color: course.published ? "#15803d" : "#92400e",
                            }}>
                              {course.published ? "Yayımlanmış" : "Qaralama"}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {enrollmentCounts[course.id] ?? "…"} şagird
                            </span>
                          </div>
                        </div>
                        <Link href={`/dashboard/teacher/courses/${course.id}`} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          Düzəlt
                        </Link>
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
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{courses.length} kurs</p>
                </div>
                <Link href="/dashboard/teacher/create-course" className="btn btn-primary" style={{ fontSize: 13 }}>
                  <Plus size={14} /> Yeni kurs
                </Link>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 90 }} />)}
                </div>
              ) : courses.length === 0 ? (
                <div className="card" style={{ padding: "60px", textAlign: "center" }}>
                  <BookOpen size={44} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Hələ kurs yaratmamısınız</p>
                  <Link href="/dashboard/teacher/create-course" className="btn btn-primary">
                    <Plus size={15} /> İlk kursu yarat
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {courses.map(course => (
                    <div key={course.id} className="card" style={{
                      padding: "16px 20px",
                      borderLeft: `3px solid ${course.published ? "#16a34a" : "#d97706"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BookOpen size={18} color="var(--accent)" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <Link href={`/dashboard/teacher/courses/${course.id}`} style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {course.title}
                            </Link>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, flexShrink: 0,
                              background: course.published ? "#dcfce7" : "#fef3c7",
                              color: course.published ? "#15803d" : "#92400e",
                            }}>
                              {course.published ? "Yayımlanmış" : "Qaralama"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {course.accessType === "FREE" ? "Pulsuz" : course.accessType === "PAID" ? `${course.price} AZN` : "Kodla"}
                              {" · "}{course.sections?.length || 0} bölmə
                            </p>
                            <button
                              onClick={() => openStudents(course.id, course.title)}
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, color: "var(--text-secondary)" }}
                            >
                              <Users size={10} color="var(--accent)" />
                              {enrollmentCounts[course.id] ?? "…"} şagird
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => togglePublish(course.id, course.published)} className="btn btn-secondary" style={{ fontSize: 11, padding: "5px 10px" }}>
                            {course.published ? <><EyeOff size={12} /> Gizlət</> : <><Eye size={12} /> Yayımla</>}
                          </button>
                          <Link href={`/dashboard/teacher/courses/${course.id}`} className="btn btn-secondary" style={{ fontSize: 11, padding: "5px 10px" }}>
                            <Edit size={12} /> Düzəlt
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm({ courseId: course.id, title: course.title })}
                            style={{ fontSize: 11, padding: "5px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TOOLS ── */}
          {activeSection === "tools" && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4 }}>AI & Alətlər</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Tədris prosesini sürətləndirin</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {[
                  {
                    href: "/dashboard/teacher/ai-quiz",
                    icon: Sparkles, title: "AI Quiz Generator",
                    desc: "Mövzu yazın, AI avtomatik quiz sualları yaratsın.",
                    color: "var(--accent)", gradient: true,
                  },
                  {
                    href: "/dashboard/teacher/quiz/create",
                    icon: ClipboardCheck, title: "Manual Quiz Yarat",
                    desc: "Özünüz sualları daxil edərək quiz yaradın.",
                    color: "#7c3aed",
                  },
                  {
                    href: "/dashboard/teacher/create-course",
                    icon: BookOpen, title: "Yeni Kurs Yarat",
                    desc: "Şagirdlər üçün yeni kurs yaradın.",
                    color: "#0ea5e9",
                  },
                  {
                    href: "/dashboard/teacher/codes",
                    icon: Key, title: "Giriş Kodları",
                    desc: "Kurslara giriş üçün kodlar yaradın və idarə edin.",
                    color: "#16a34a",
                  },
                ].map(({ href, icon: Icon, title, desc, color, gradient }) => (
                  <Link key={href} href={href} style={{
                    display: "block", padding: 22, borderRadius: "var(--radius)",
                    textDecoration: "none",
                    background: gradient ? `linear-gradient(135deg, ${color}, #e8741a)` : "var(--bg-card)",
                    border: gradient ? "none" : "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s ease",
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: gradient ? "rgba(255,255,255,0.2)" : `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <Icon size={18} color={gradient ? "white" : color} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: gradient ? "white" : "var(--text-primary)", marginBottom: 6, fontFamily: "Syne, sans-serif" }}>{title}</h3>
                    <p style={{ fontSize: 13, color: gradient ? "rgba(255,255,255,0.8)" : "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>{desc}</p>
                    <span style={{ fontSize: 12, fontWeight: 600, color: gradient ? "white" : color, display: "flex", alignItems: "center", gap: 4 }}>
                      Başla <ArrowRight size={13} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1001, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={22} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: 17 }}>Kursu sil</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Bu əməliyyat geri qaytarıla bilməz</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm.title}</strong> kursunu silmək istədiyinizə əminsiniz?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary" style={{ fontSize: 14 }} disabled={deleting}>Ləğv et</button>
              <button onClick={deleteCourse} disabled={deleting} style={{ fontSize: 14, padding: "8px 20px", borderRadius: 8, border: "none", background: "#dc2626", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Silinir..." : <><Trash2 size={14} /> Sil</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {studentsModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setStudentsModal(null); }}>
          <div className="card" style={{ width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}><GraduationCap size={20} color="var(--accent)" /> Şagirdlər</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{studentsModal.title}</p>
              </div>
              <button onClick={() => setStudentsModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}>
                <X size={20} />
              </button>
            </div>
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
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Cəmi {students.length} şagird</p>
                  {students.map((s: any, i: number) => (
                    <div key={s.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border)" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>
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
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: s.status === "ACTIVE" ? "#dcfce7" : "#fef3c7", color: s.status === "ACTIVE" ? "#15803d" : "#92400e", flexShrink: 0 }}>
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
