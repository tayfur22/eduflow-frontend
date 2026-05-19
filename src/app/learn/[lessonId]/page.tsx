"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight,
  BookOpen, MessageSquare, FileText, ArrowLeft, Send, Loader2
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
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get(`/api/lessons/${lessonId}`)
      .then(r => {
        setLesson(r.data);
        if (r.data.courseId) {
          api.get(`/api/courses/public/${r.data.courseId}`)
            .then(cr => setCourse(cr.data))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get("/api/progress/my")
      .then(r => {
        const done = r.data.some((p: any) => p.lessonId === Number(lessonId) && p.completed);
        setCompleted(done);
      })
      .catch(() => {});
  }, [lessonId, user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiAnswer]);

  const completeLesson = async () => {
    setCompleting(true);
    try {
      await api.post(`/api/progress/complete/${lessonId}`);
      setCompleted(true);
    } catch (e) {}
    finally { setCompleting(false); }
  };

  const askAi = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    const q = aiQuestion;
    setAiQuestion("");
    setAiLoading(true);
    setAiAnswer("");
    try {
      const r = await api.post("/api/ai/tutor", { lessonId: Number(lessonId), question: q });
      const answer = r.data.answer;
      setMessages(prev => [...prev, { q, a: answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { q, a: "Xəta baş verdi. Yenidən cəhd edin." }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    </div>
  );

  if (!lesson) return (
    <div className="page" style={{ paddingTop: 120, textAlign: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Dərs tapılmadı</p>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 64 }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 64px)" }}>

        {/* Sidebar */}
        <div style={{
          borderRight: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          overflowY: "auto",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
        }}>
          <div style={{ padding: "20px 16px" }}>
            <Link href={course ? `/courses/${course.id}` : "/courses"} className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 10px", marginBottom: 16, display: "inline-flex" }}>
              <ArrowLeft size={13} /> {course?.title || "Kursa qayıt"}
            </Link>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Kurs proqramı
            </h3>
            {course?.sections?.map((section: any) => (
              <div key={section.id} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, padding: "0 4px" }}>
                  {section.title}
                </p>
                {section.lessons?.map((l: any) => (
                  <Link key={l.id} href={`/learn/${l.id}`} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, textDecoration: "none",
                    background: l.id === Number(lessonId) ? "var(--accent-soft)" : "transparent",
                    marginBottom: 2,
                  }}>
                    <Circle size={14} color={l.id === Number(lessonId) ? "var(--accent)" : "var(--text-muted)"} />
                    <span style={{
                      fontSize: 13,
                      color: l.id === Number(lessonId) ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: l.id === Number(lessonId) ? 600 : 400,
                    }}>
                      {l.title}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ overflowY: "auto" }}>
          {/* Lesson header */}
          <div style={{ borderBottom: "1px solid var(--border)", padding: "24px 32px", background: "var(--bg-card)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: 22, lineHeight: 1.3 }}>{lesson.title}</h1>
              <button
                onClick={completeLesson}
                disabled={completed || completing}
                className={`btn ${completed ? "btn-secondary" : "btn-primary"}`}
                style={{ fontSize: 13 }}
              >
                {completed
                  ? <><CheckCircle size={15} /> Tamamlandı</>
                  : completing ? <><Loader2 size={15} className="animate-spin" /> ...</>
                  : <><CheckCircle size={15} /> Tamamla</>
                }
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
              {[
                { key: "content", label: "Məzmun", icon: FileText },
                { key: "ai", label: "AI Tutor", icon: MessageSquare },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as any)}
                  className="btn"
                  style={{
                    fontSize: 13, padding: "7px 14px",
                    background: tab === key ? "var(--accent)" : "transparent",
                    color: tab === key ? "white" : "var(--text-secondary)",
                    border: `1px solid ${tab === key ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ padding: "32px" }}>
            {tab === "content" && (
              <div className="animate-fade-in">
                {lesson.videoUrl && (
                  <div style={{ marginBottom: 32, borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
                    <iframe
                      src={lesson.videoUrl.replace("watch?v=", "embed/")}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allowFullScreen
                    />
                  </div>
                )}

                {lesson.description && (
                  <div style={{
                    fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)",
                    background: "var(--bg-secondary)", borderRadius: 12,
                    padding: 24, border: "1px solid var(--border)",
                  }}>
                    {lesson.description}
                  </div>
                )}

                {!lesson.videoUrl && !lesson.description && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                    <p>Bu dərsin məzmunu hələ əlavə edilməyib</p>
                  </div>
                )}
              </div>
            )}

            {tab === "ai" && (
              <div className="animate-fade-in" style={{ maxWidth: 680 }}>
                <div style={{
                  minHeight: 320, maxHeight: 460,
                  overflowY: "auto",
                  display: "flex", flexDirection: "column", gap: 16,
                  marginBottom: 20,
                  padding: 4,
                }}>
                  {messages.length === 0 && !aiLoading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                      <MessageSquare size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                      <p style={{ fontSize: 15 }}>Bu dərsə aid sual ver</p>
                      <p style={{ fontSize: 13, marginTop: 6 }}>AI tutor sənə kömək edəcək</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{
                        alignSelf: "flex-end", background: "var(--accent)",
                        color: "white", padding: "10px 16px", borderRadius: "12px 12px 4px 12px",
                        fontSize: 14, maxWidth: "80%",
                      }}>
                        {m.q}
                      </div>
                      <div style={{
                        alignSelf: "flex-start", background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)", padding: "12px 16px",
                        borderRadius: "4px 12px 12px 12px",
                        fontSize: 14, lineHeight: 1.7, maxWidth: "85%",
                        whiteSpace: "pre-wrap",
                      }}>
                        {m.a}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ display: "flex", gap: 6, padding: "12px 16px", alignItems: "center", color: "var(--text-muted)" }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span style={{ fontSize: 13 }}>AI cavab hazırlayır...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    placeholder="Sualını yaz..."
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && askAi()}
                  />
                  <button onClick={askAi} disabled={aiLoading || !aiQuestion.trim()} className="btn btn-primary" style={{ padding: "0 18px", flexShrink: 0 }}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
