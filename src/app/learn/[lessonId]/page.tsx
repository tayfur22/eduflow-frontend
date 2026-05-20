"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight,
  BookOpen, MessageSquare, FileText, ArrowLeft,
  Send, Loader2, Play, Award, Lock
} from "lucide-react";

export default function LearnPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"content" | "ai">("content");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([]);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }

    // Progress yüklə
    api.get("/api/progress/my")
      .then(r => {
        const done = r.data.filter((p: any) => p.completed).map((p: any) => p.lessonId);
        setCompletedLessons(done);
        setCompleted(done.includes(Number(lessonId)));
      }).catch(() => {});

    // Lesson məlumatı backend-də /api/lessons/{id} endpoint yoxdursa
    // course public API-dən lesson-u tapırıq
    // Əvvəlcə enrollments-dən courseId tapırıq
    api.get("/api/enrollments/my")
      .then(async (er) => {
        // Hər enrollment-ın kursunu yoxlayırıq
        for (const enrollment of er.data) {
          const cr = await api.get(`/api/courses/public/${enrollment.courseId}`);
          const foundCourse = cr.data;
          for (const section of foundCourse.sections || []) {
            const foundLesson = section.lessons?.find((l: any) => l.id === Number(lessonId));
            if (foundLesson) {
              setLesson({ ...foundLesson, courseId: foundCourse.id });
              setCourse(foundCourse);
              // Quiz-ləri yüklə
              api.get(`/api/courses/${foundCourse.id}/quizzes`).then(qr => setQuizzes(qr.data)).catch(() => {});
              setLoading(false);
              return;
            }
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [lessonId, user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const completeLesson = async () => {
    setCompleting(true);
    try {
      await api.post(`/api/progress/complete/${lessonId}`);
      setCompleted(true);
      setCompletedLessons(prev => [...prev, Number(lessonId)]);
    } catch (e) { }
    finally { setCompleting(false); }
  };

  const askAi = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    const q = aiQuestion;
    setAiQuestion("");
    setAiLoading(true);
    try {
      const r = await api.post("/api/ai/tutor", { lessonId: Number(lessonId), question: q });
      setMessages(prev => [...prev, { q, a: r.data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { q, a: "Xəta baş verdi. Yenidən cəhd edin." }]);
    } finally { setAiLoading(false); }
  };

  // Əvvəlki / Növbəti dərs
  const allLessons = course?.sections?.flatMap((s: any) => s.lessons || []) || [];
  const currentIdx = allLessons.findIndex((l: any) => l.id === Number(lessonId));
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    </div>
  );

  if (!lesson) return (
    <div className="page" style={{ paddingTop: 120, textAlign: "center" }}>
      <Lock size={40} style={{ margin: "0 auto 16px", opacity: 0.3, color: "var(--text-muted)" }} />
      <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Dərs tapılmadı və ya girişiniz yoxdur</p>
      <Link href="/courses" className="btn btn-primary" style={{ margin: "16px auto 0", display: "inline-flex" }}>
        Kurslara qayıt
      </Link>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 64 }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 64px)" }}>

        {/* Sidebar */}
        <div style={{
          borderRight: "1px solid var(--border)", background: "var(--bg-secondary)",
          overflowY: "auto", position: "sticky", top: 64, height: "calc(100vh - 64px)",
        }}>
          <div style={{ padding: "20px 14px" }}>
            <Link href={course ? `/courses/${course.id}` : "/courses"} className="btn btn-ghost"
              style={{ fontSize: 12, padding: "6px 10px", marginBottom: 16, display: "inline-flex" }}>
              <ArrowLeft size={13} /> {course?.title || "Kursa qayıt"}
            </Link>

            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, padding: "0 4px" }}>
              Kurs proqramı
            </p>

            {course?.sections?.map((section: any) => (
              <div key={section.id} style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, padding: "0 4px" }}>
                  {section.title}
                </p>
                {section.lessons?.map((l: any) => {
                  const isCurrent = l.id === Number(lessonId);
                  const isDone = completedLessons.includes(l.id);
                  return (
                    <Link key={l.id} href={`/learn/${l.id}`} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 8, textDecoration: "none",
                      background: isCurrent ? "var(--accent-soft)" : "transparent",
                      marginBottom: 2,
                    }}>
                      {isDone
                        ? <CheckCircle size={13} color="#16a34a" />
                        : <Circle size={13} color={isCurrent ? "var(--accent)" : "var(--text-muted)"} />}
                      <span style={{
                        fontSize: 13,
                        color: isCurrent ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: isCurrent ? 600 : 400,
                        flex: 1, lineHeight: 1.4,
                      }}>
                        {l.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}

            {quizzes.length > 0 && (
              <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, padding: "0 4px" }}>
                  Quizlər
                </p>
                {quizzes.map((q: any) => (
                  <Link key={q.id} href={`/quiz/${q.id}`} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, textDecoration: "none", marginBottom: 2,
                  }}>
                    <Award size={13} color="var(--accent)" />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{q.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div style={{ overflowY: "auto" }}>
          {/* Lesson header */}
          <div style={{ borderBottom: "1px solid var(--border)", padding: "22px 32px", background: "var(--bg-card)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: 21, lineHeight: 1.3 }}>{lesson.title}</h1>
              <button
                onClick={completeLesson}
                disabled={completed || completing}
                className={`btn ${completed ? "btn-secondary" : "btn-primary"}`}
                style={{ fontSize: 13 }}
              >
                {completed
                  ? <><CheckCircle size={14} /> Tamamlandı</>
                  : completing
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> ...</>
                    : <><CheckCircle size={14} /> Tamamla</>}
              </button>
            </div>

            <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
              {[
                { key: "content", label: "Məzmun", icon: FileText },
                { key: "ai", label: "AI Tutor", icon: MessageSquare },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key as any)} className="btn" style={{
                  fontSize: 13, padding: "7px 14px",
                  background: tab === key ? "var(--accent)" : "transparent",
                  color: tab === key ? "white" : "var(--text-secondary)",
                  border: `1px solid ${tab === key ? "var(--accent)" : "var(--border)"}`,
                }}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "32px" }}>
            {tab === "content" && (
              <div className="animate-fade-in">
                {/* Video */}
                {lesson.contentUrl && lesson.lessonType === "VIDEO" && (
                  <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
                    <iframe
                      src={lesson.contentUrl.includes("youtube.com/watch")
                        ? lesson.contentUrl.replace("watch?v=", "embed/")
                        : lesson.contentUrl}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allowFullScreen
                    />
                  </div>
                )}

                {/* PDF */}
                {lesson.contentUrl && lesson.lessonType === "PDF" && (
                  <div style={{ marginBottom: 28 }}>
                    <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-secondary" style={{ display: "inline-flex", gap: 8 }}>
                      <BookOpen size={16} /> PDF-i aç
                    </a>
                  </div>
                )}

                {/* Text content */}
                {lesson.textContent && (
                  <div style={{
                    fontSize: 15, lineHeight: 1.85, color: "var(--text-secondary)",
                    background: "var(--bg-secondary)", borderRadius: 12,
                    padding: "24px 28px", border: "1px solid var(--border)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {lesson.textContent}
                  </div>
                )}

                {!lesson.contentUrl && !lesson.textContent && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
                    <p>Bu dərsin məzmunu hələ əlavə edilməyib</p>
                  </div>
                )}

                {/* Prev / Next */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                  {prevLesson ? (
                    <Link href={`/learn/${prevLesson.id}`} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ChevronLeft size={15} /> {prevLesson.title}
                    </Link>
                  ) : <div />}
                  {nextLesson ? (
                    <Link href={`/learn/${nextLesson.id}`} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {nextLesson.title} <ChevronRight size={15} />
                    </Link>
                  ) : (
                    <button onClick={completeLesson} disabled={completed || completing} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {completed ? <><CheckCircle size={14} /> Bitdi</> : <><Play size={14} /> Kursu bitir</>}
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === "ai" && (
              <div className="animate-fade-in" style={{ maxWidth: 700 }}>
                <div style={{
                  minHeight: 320, maxHeight: 460, overflowY: "auto",
                  display: "flex", flexDirection: "column", gap: 14,
                  marginBottom: 18, padding: 4,
                }}>
                  {messages.length === 0 && !aiLoading && (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
                      <MessageSquare size={36} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
                      <p style={{ fontSize: 15 }}>Bu dərslə bağlı sual ver</p>
                      <p style={{ fontSize: 13, marginTop: 6 }}>AI tutor sənə kömək edəcək</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{
                        alignSelf: "flex-end", background: "var(--accent)",
                        color: "white", padding: "10px 16px",
                        borderRadius: "12px 12px 4px 12px",
                        fontSize: 14, maxWidth: "80%",
                      }}>{m.q}</div>
                      <div style={{
                        alignSelf: "flex-start", background: "var(--bg-secondary)",
                        border: "1px solid var(--border)", color: "var(--text-primary)",
                        padding: "12px 16px", borderRadius: "4px 12px 12px 12px",
                        fontSize: 14, lineHeight: 1.75, maxWidth: "85%", whiteSpace: "pre-wrap",
                      }}>{m.a}</div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ display: "flex", gap: 8, padding: "10px 14px", alignItems: "center", color: "var(--text-muted)" }}>
                      <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: 13 }}>AI cavab hazırlayır...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    placeholder="Sualını yaz... (Enter ilə göndər)"
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && askAi()}
                  />
                  <button onClick={askAi} disabled={aiLoading || !aiQuestion.trim()}
                    className="btn btn-primary" style={{ padding: "0 18px", flexShrink: 0 }}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
