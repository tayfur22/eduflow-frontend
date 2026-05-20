"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  ArrowLeft, Plus, BookOpen, Play, Trash2, ChevronDown,
  ChevronRight, Edit, Video, FileText, ClipboardList,
  Eye, EyeOff, Loader2, X, Check, GripVertical
} from "lucide-react";

export default function TeacherCourseManagePage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<number[]>([0]);

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionLoading, setSectionLoading] = useState(false);

  // Lesson modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "", description: "", videoUrl: "", lessonType: "VIDEO", orderIndex: 0,
  });
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = () => {
    api.get(`/api/courses/public/${id}`)
      .then(r => setCourse(r.data))
      .catch(() => router.push("/dashboard/teacher"))
      .finally(() => setLoading(false));
  };

  const addSection = async () => {
    if (!sectionTitle.trim()) return;
    setSectionLoading(true);
    try {
      await api.post(`/api/courses/${id}/sections`, {
        title: sectionTitle,
        orderIndex: course.sections?.length || 0,
      });
      setSectionTitle("");
      setShowSectionModal(false);
      loadCourse();
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setSectionLoading(false);
    }
  };

  const openAddLesson = (sectionId: number) => {
    setActiveSectionId(sectionId);
    const section = course.sections?.find((s: any) => s.id === sectionId);
    setLessonForm({
      title: "", description: "", videoUrl: "",
      lessonType: "VIDEO",
      orderIndex: section?.lessons?.length || 0,
    });
    setShowLessonModal(true);
  };

  const addLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setLessonLoading(true);
    try {
      await api.post(`/api/sections/${activeSectionId}/lessons`, lessonForm);
      setShowLessonModal(false);
      loadCourse();
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setLessonLoading(false);
    }
  };

  const togglePublish = async () => {
    const ep = course.published ? "unpublish" : "publish";
    await api.put(`/api/courses/${id}/${ep}`);
    setCourse((prev: any) => ({ ...prev, published: !prev.published }));
  };

  const toggleSection = (i: number) =>
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const lessonTypeIcon = (type: string) => {
    if (type === "VIDEO") return <Video size={13} color="var(--accent)" />;
    if (type === "PDF") return <FileText size={13} color="#7c3aed" />;
    return <FileText size={13} color="var(--text-muted)" />;
  };

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        <div className="skeleton" style={{ height: 40, width: "50%", marginBottom: 20 }} />
        {[1, 2].map(i => <div key={i} className="card skeleton" style={{ height: 100, marginBottom: 12 }} />)}
      </div>
    </div>
  );

  if (!course) return null;

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "32px 0" }}>
        <div className="container">
          <button onClick={() => router.back()} className="btn btn-ghost"
            style={{ fontSize: 13, padding: "6px 12px", marginBottom: 16, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Geri
          </button>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, marginBottom: 6 }}>{course.title}</h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {course.sections?.length || 0} bölmə ·{" "}
                {course.sections?.reduce((a: number, s: any) => a + (s.lessons?.length || 0), 0)} dərs
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/dashboard/teacher/codes?courseId=${id}`} className="btn btn-secondary" style={{ fontSize: 13 }}>
                🔑 Kodlar
              </Link>
              <Link href={`/courses/${id}/quizzes`} className="btn btn-secondary" style={{ fontSize: 13 }}>
                <ClipboardList size={14} /> Quizlər
              </Link>
              <button onClick={togglePublish} className={`btn ${course.published ? "btn-secondary" : "btn-primary"}`} style={{ fontSize: 13 }}>
                {course.published ? <><EyeOff size={14} /> Gizlət</> : <><Eye size={14} /> Yayımla</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Sections */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20 }}>Bölmələr və dərslər</h2>
            <button onClick={() => setShowSectionModal(true)} className="btn btn-primary" style={{ fontSize: 13 }}>
              <Plus size={15} /> Bölmə əlavə et
            </button>
          </div>

          {course.sections?.length === 0 ? (
            <div className="card" style={{ padding: "60px", textAlign: "center" }}>
              <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.25, color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Hələ bölmə yoxdur</p>
              <button onClick={() => setShowSectionModal(true)} className="btn btn-primary">
                <Plus size={15} /> İlk bölməni yarat
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {course.sections?.map((section: any, i: number) => (
                <div key={section.id} className="card animate-fade-up" style={{ overflow: "hidden", animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  {/* Section header */}
                  <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12 }}>
                    <button onClick={() => toggleSection(i)} style={{
                      flex: 1, display: "flex", alignItems: "center", gap: 12,
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "var(--accent-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "var(--accent)",
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{section.title}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{section.lessons?.length || 0} dərs</p>
                      </div>
                      {openSections.includes(i)
                        ? <ChevronDown size={16} color="var(--text-muted)" />
                        : <ChevronRight size={16} color="var(--text-muted)" />
                      }
                    </button>
                    <button onClick={() => openAddLesson(section.id)} className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}>
                      <Plus size={13} /> Dərs
                    </button>
                  </div>

                  {/* Lessons */}
                  {openSections.includes(i) && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {section.lessons?.length === 0 ? (
                        <div style={{ padding: "20px 20px 20px 64px", color: "var(--text-muted)", fontSize: 13 }}>
                          Hələ dərs yoxdur — yuxarıdan əlavə edin
                        </div>
                      ) : (
                        section.lessons?.map((lesson: any, li: number) => (
                          <div key={lesson.id} style={{
                            padding: "12px 20px 12px 64px",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            borderBottom: li < section.lessons.length - 1 ? "1px solid var(--border)" : "none",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {lessonTypeIcon(lesson.lessonType)}
                              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{lesson.title}</span>
                              {lesson.videoUrl && (
                                <a href={lesson.videoUrl} target="_blank" rel="noreferrer"
                                  style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>
                                  ↗ Link
                                </a>
                              )}
                            </div>
                            <Link href={`/learn/${lesson.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}>
                              <Play size={12} /> Bax
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowSectionModal(false)}>
          <div className="card animate-fade-up" style={{ width: "100%", maxWidth: 480, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Yeni bölmə</h3>
              <button onClick={() => setShowSectionModal(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>
            <input
              className="input"
              placeholder="Bölmənin adı — məs: Giriş, OOP əsasları..."
              value={sectionTitle}
              onChange={e => setSectionTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSection()}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowSectionModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Ləğv et</button>
              <button onClick={addSection} disabled={sectionLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                {sectionLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Check size={15} /> Yarat</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowLessonModal(false)}>
          <div className="card animate-fade-up" style={{ width: "100%", maxWidth: 560, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Yeni dərs</h3>
              <button onClick={() => setShowLessonModal(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>Dərs adı *</label>
                <input className="input" placeholder="məs: Java-ya giriş" value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} autoFocus />
              </div>

              {/* Type */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>Dərs növü</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { value: "VIDEO", label: "Video", icon: Video },
                    { value: "PDF", label: "PDF", icon: FileText },
                    { value: "TEXT", label: "Mətn", icon: Edit },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setLessonForm({ ...lessonForm, lessonType: value })}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: `2px solid ${lessonForm.lessonType === value ? "var(--accent)" : "var(--border)"}`,
                        background: lessonForm.lessonType === value ? "var(--accent-soft)" : "transparent",
                        color: lessonForm.lessonType === value ? "var(--accent)" : "var(--text-secondary)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              {lessonForm.lessonType === "VIDEO" && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                    YouTube / Video link
                  </label>
                  <input className="input" placeholder="https://youtube.com/watch?v=..."
                    value={lessonForm.videoUrl}
                    onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} />
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Açıqlama / Mətn
                </label>
                <textarea className="input" placeholder="Dərs haqqında qısa məlumat..."
                  rows={3} value={lessonForm.description}
                  onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  style={{ resize: "vertical" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowLessonModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Ləğv et</button>
              <button onClick={addLesson} disabled={lessonLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                {lessonLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Check size={15} /> Əlavə et</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
