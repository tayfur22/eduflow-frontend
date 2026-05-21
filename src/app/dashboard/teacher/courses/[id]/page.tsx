"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { uploadToCloudinary, formatBytes, getFileIcon, ACCEPTED_FILE_TYPES } from "@/lib/cloudinary";
import {
  ArrowLeft, Plus, BookOpen, Play, Trash2, ChevronDown,
  ChevronRight, Edit, Video, FileText, ClipboardList,
  Eye, EyeOff, Loader2, X, Check, Upload,
  Link2, Film, FileImage, AlertCircle, CheckCircle
} from "lucide-react";

type LessonType = "VIDEO" | "PDF" | "TEXT" | "FILE";

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
    title: "",
    description: "",
    videoUrl: "",
    lessonType: "VIDEO" as LessonType,
    orderIndex: 0,
  });
  const [lessonLoading, setLessonLoading] = useState(false);

  // Upload state
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadCourse(); }, [id]);

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
    setUploadMode("url");
    setUploadFile(null);
    setUploadProgress(0);
    setUploadedUrl("");
    setUploadError("");
    setShowLessonModal(true);
  };

  // Fayl seçildikdə avtomatik upload et
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadError("");
    setUploadProgress(0);
    setUploadedUrl("");
    setUploading(true);

    try {
      const result = await uploadToCloudinary(file, (pct) => setUploadProgress(pct));
      setUploadedUrl(result.url);
      setLessonForm(prev => ({ ...prev, videoUrl: result.url }));
    } catch (err: any) {
      setUploadError(err.message || "Upload xətası");
    } finally {
      setUploading(false);
    }
  };

  const addLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setLessonLoading(true);
    try {
      const payload = {
        ...lessonForm,
        videoUrl: uploadedUrl || lessonForm.videoUrl,
      };
      await api.post(`/api/sections/${activeSectionId}/lessons`, payload);
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
    if (type === "VIDEO") return <Film size={13} color="var(--accent)" />;
    if (type === "PDF") return <FileText size={13} color="#7c3aed" />;
    if (type === "FILE") return <FileImage size={13} color="#059669" />;
    return <FileText size={13} color="var(--text-muted)" />;
  };

  // Fayl növünə görə accept attribute
  const getAccept = (type: LessonType) => {
    if (type === "VIDEO") return ACCEPTED_FILE_TYPES.VIDEO;
    if (type === "PDF") return ACCEPTED_FILE_TYPES.PDF;
    return ACCEPTED_FILE_TYPES.ALL;
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                  <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12 }}>
                    <button onClick={() => toggleSection(i)} style={{
                      flex: 1, display: "flex", alignItems: "center", gap: 12,
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)",
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
                        : <ChevronRight size={16} color="var(--text-muted)" />}
                    </button>
                    <button onClick={() => openAddLesson(section.id)} className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}>
                      <Plus size={13} /> Dərs
                    </button>
                  </div>

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
          zIndex: 1000, padding: 20, overflowY: "auto",
        }} onClick={e => e.target === e.currentTarget && setShowLessonModal(false)}>
          <div className="card animate-fade-up" style={{ width: "100%", maxWidth: 580, padding: 32, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Yeni dərs əlavə et</h3>
              <button onClick={() => setShowLessonModal(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Dərs adı *
                </label>
                <input className="input" placeholder="məs: Java-ya giriş"
                  value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} autoFocus />
              </div>

              {/* Lesson Type */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Dərs növü
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { value: "VIDEO", label: "Video", icon: Film },
                    { value: "PDF", label: "PDF", icon: FileText },
                    { value: "TEXT", label: "Mətn", icon: Edit },
                    { value: "FILE", label: "Fayl", icon: Upload },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value}
                      onClick={() => {
                        setLessonForm({ ...lessonForm, lessonType: value as LessonType });
                        setUploadFile(null);
                        setUploadedUrl("");
                        setUploadProgress(0);
                        setUploadError("");
                        setUploadMode("url");
                      }}
                      style={{
                        padding: "10px 6px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `2px solid ${lessonForm.lessonType === value ? "var(--accent)" : "var(--border)"}`,
                        background: lessonForm.lessonType === value ? "var(--accent-soft)" : "transparent",
                        color: lessonForm.lessonType === value ? "var(--accent)" : "var(--text-secondary)",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 5, transition: "all 0.18s",
                      }}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video/PDF/File - URL ya da Upload */}
              {lessonForm.lessonType !== "TEXT" && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
                    {lessonForm.lessonType === "VIDEO" ? "Video mənbəyi" : "Fayl mənbəyi"}
                  </label>

                  {/* Toggle: URL vs Upload */}
                  {lessonForm.lessonType === "VIDEO" && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                      {[
                        { value: "url", label: "YouTube / Link", icon: Link2 },
                        { value: "file", label: "Fayl yüklə", icon: Upload },
                      ].map(({ value, label, icon: Icon }) => (
                        <button key={value}
                          onClick={() => { setUploadMode(value as "url" | "file"); setUploadFile(null); setUploadedUrl(""); setUploadProgress(0); }}
                          style={{
                            flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            border: `1px solid ${uploadMode === value ? "var(--accent)" : "var(--border)"}`,
                            background: uploadMode === value ? "var(--accent-soft)" : "transparent",
                            color: uploadMode === value ? "var(--accent)" : "var(--text-secondary)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}>
                          <Icon size={13} /> {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* YouTube URL input */}
                  {lessonForm.lessonType === "VIDEO" && uploadMode === "url" && (
                    <input className="input"
                      placeholder="https://youtube.com/watch?v=... və ya https://vimeo.com/..."
                      value={lessonForm.videoUrl}
                      onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} />
                  )}

                  {/* File Upload */}
                  {(lessonForm.lessonType !== "VIDEO" || uploadMode === "file") && lessonForm.lessonType !== "TEXT" && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={getAccept(lessonForm.lessonType)}
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />

                      {!uploadFile ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            width: "100%", padding: "32px 20px", borderRadius: 10,
                            border: "2px dashed var(--border)",
                            background: "var(--bg-secondary)",
                            cursor: "pointer", textAlign: "center", color: "var(--text-muted)",
                            transition: "all 0.18s",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                          }}
                        >
                          <Upload size={28} style={{ margin: "0 auto 10px" }} />
                          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                            {lessonForm.lessonType === "VIDEO" ? "Video fayl seçin" :
                              lessonForm.lessonType === "PDF" ? "PDF fayl seçin" :
                                "Fayl seçin"}
                          </p>
                          <p style={{ fontSize: 12 }}>
                            {lessonForm.lessonType === "VIDEO" ? "MP4, WebM, MOV" :
                              lessonForm.lessonType === "PDF" ? "PDF" :
                                "PDF, Word, şəkil, video, və s."}
                            {" · "}Cloudinary-ə yüklənəcək
                          </p>
                        </button>
                      ) : (
                        <div style={{
                          padding: "16px", borderRadius: 10,
                          border: `1px solid ${uploadError ? "#fca5a5" : uploadedUrl ? "#86efac" : "var(--border)"}`,
                          background: uploadError ? "#fef2f2" : uploadedUrl ? "#f0fdf4" : "var(--bg-secondary)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 24 }}>{getFileIcon(uploadFile)}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {uploadFile.name}
                              </p>
                              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {formatBytes(uploadFile.size)}
                              </p>
                            </div>
                            {!uploading && (
                              <button onClick={() => {
                                setUploadFile(null);
                                setUploadedUrl("");
                                setUploadProgress(0);
                                setUploadError("");
                                setLessonForm(prev => ({ ...prev, videoUrl: "" }));
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }} className="btn btn-ghost" style={{ padding: 6, flexShrink: 0 }}>
                                <X size={15} />
                              </button>
                            )}
                          </div>

                          {/* Progress bar */}
                          {uploading && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", width: `${uploadProgress}%`,
                                  background: "var(--accent)", borderRadius: 3,
                                  transition: "width 0.3s ease",
                                }} />
                              </div>
                              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                                Yüklənir... {uploadProgress}%
                              </p>
                            </div>
                          )}

                          {/* Success */}
                          {uploadedUrl && !uploading && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 13, color: "#15803d" }}>
                              <CheckCircle size={14} /> Uğurla yükləndi
                            </div>
                          )}

                          {/* Error */}
                          {uploadError && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "#dc2626" }}>
                              <AlertCircle size={13} /> {uploadError}
                              <button onClick={() => fileInputRef.current?.click()}
                                style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                                Yenidən cəhd et
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Description / Text content */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  {lessonForm.lessonType === "TEXT" ? "Dərs mətni" : "Açıqlama"}
                </label>
                <textarea className="input"
                  placeholder={lessonForm.lessonType === "TEXT"
                    ? "Dərs məzmununu buraya yazın — izah, kod nümunəsi, qeydlər..."
                    : "Dərs haqqında qısa məlumat..."}
                  rows={lessonForm.lessonType === "TEXT" ? 8 : 3}
                  value={lessonForm.description}
                  onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  style={{ resize: "vertical", lineHeight: 1.6 }} />
              </div>
            </div>

            {/* Cloudinary info note */}
            {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
              <div style={{
                marginTop: 16, padding: "10px 14px", background: "#fef3c7",
                border: "1px solid #fcd34d", borderRadius: 8, fontSize: 12, color: "#92400e",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Fayl yükləmə üçün <code>.env.local</code>-a Cloudinary məlumatlarını əlavə edin:
                  <br /><code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...</code>
                  <br /><code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...</code>
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowLessonModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Ləğv et
              </button>
              <button onClick={addLesson}
                disabled={lessonLoading || uploading}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}>
                {lessonLoading
                  ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  : <><Check size={15} /> Dərsi əlavə et</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
