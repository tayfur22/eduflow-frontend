"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { Sparkles, ArrowLeft, CheckCircle, AlertCircle, Loader2, BookOpen } from "lucide-react";

export default function AiQuizGeneratorPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const [form, setForm] = useState({
    topic: "",
    questionCount: 5,
    difficulty: "MEDIUM",
    courseId: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!form.topic.trim()) return setError("Mövzu daxil edin");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await api.post("/api/ai/quiz/generate", {
        topic: form.topic,
        questionCount: form.questionCount,
        difficulty: form.difficulty,
        courseId: form.courseId ? Number(form.courseId) : null,
      });
      setResult(r.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container">
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 12px", marginBottom: 20, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Geri qayıt
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), #e8741a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, marginBottom: 4 }}>{t("quiz_generator")}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Mövzu yazın, AI avtomatik quiz yaratsın</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 28, alignItems: "start" }}>

            {/* Form */}
            <div className="card animate-fade-up" style={{ padding: 28, position: "sticky", top: 80 }}>
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Quiz parametrləri</h3>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Topic */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                    {t("quiz_topic")} *
                  </label>
                  <input
                    className="input"
                    placeholder={t("quiz_topic_placeholder")}
                    value={form.topic}
                    onChange={e => setForm({ ...form, topic: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && generate()}
                  />
                </div>

                {/* Question count */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                    {t("quiz_count")}: <span style={{ color: "var(--accent)" }}>{form.questionCount}</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={form.questionCount}
                    onChange={e => setForm({ ...form, questionCount: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "var(--accent)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    <span>3</span><span>10</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                    {t("quiz_difficulty")}
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[
                      { value: "EASY", label: t("quiz_easy"), color: "#16a34a" },
                      { value: "MEDIUM", label: t("quiz_medium"), color: "var(--accent)" },
                      { value: "HARD", label: t("quiz_hard"), color: "#dc2626" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setForm({ ...form, difficulty: opt.value })}
                        style={{
                          flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: `2px solid ${form.difficulty === opt.value ? opt.color : "var(--border)"}`,
                          background: form.difficulty === opt.value ? `${opt.color}15` : "transparent",
                          color: form.difficulty === opt.value ? opt.color : "var(--text-secondary)",
                          cursor: "pointer", transition: "all 0.18s",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={generate}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, marginTop: 4 }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      {t("quiz_generating")}
                    </span>
                  ) : (
                    <><Sparkles size={16} /> {t("quiz_generate")}</>
                  )}
                </button>
              </div>
            </div>

            {/* Result */}
            <div>
              {!result && !loading && (
                <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid var(--border)" }}>
                    <Sparkles size={30} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 8 }}>Quiz generatoru</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                    Sol tərəfdən mövzu seçin və AI avtomatik suallar yaratsın.<br />
                    Yaradılan sualları öz kursunuza əlavə edə bilərsiniz.
                  </p>
                </div>
              )}

              {loading && (
                <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                  <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>AI quiz hazırlayır...</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>Bu bir neçə saniyə çəkə bilər</p>
                </div>
              )}

              {result && (
                <div className="animate-fade-up">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20 }}>
                      <span style={{ color: "var(--accent)" }}>{result.questions?.length}</span> sual yaradıldı — {result.topic}
                    </h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {result.questions?.map((q: any, i: number) => (
                      <div key={i} className="card animate-fade-up" style={{ padding: 24, animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0, fontFamily: "Syne, sans-serif" }}>
                            {i + 1}
                          </div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{q.questionText}</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                          {q.options?.map((opt: string, oi: number) => (
                            <div key={oi} style={{
                              padding: "10px 14px", borderRadius: 8, fontSize: 14,
                              background: opt === q.correctAnswer ? "#dcfce7" : "var(--bg-secondary)",
                              border: `1px solid ${opt === q.correctAnswer ? "#86efac" : "var(--border)"}`,
                              color: opt === q.correctAnswer ? "#15803d" : "var(--text-secondary)",
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                              {opt === q.correctAnswer && <CheckCircle size={14} color="#16a34a" />}
                              {opt}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div style={{ padding: "10px 14px", background: "var(--accent-soft)", borderRadius: 8, fontSize: 13, color: "var(--accent)", display: "flex", gap: 8 }}>
                            <BookOpen size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
