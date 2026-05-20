"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  ArrowRight, ArrowLeft, Check, Trophy, RotateCcw
} from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.quizId;
  const { user } = useAuthStore();

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get(`/api/quizzes/${quizId}/start`)
      .then(r => {
        setQuiz(r.data);
        if (r.data.timeLimitMinutes) {
          setTimeLeft(r.data.timeLimitMinutes * 60);
        }
      })
      .catch(() => setError("Quiz tapılmadı"))
      .finally(() => setLoading(false));
  }, [quizId, user]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId: Number(questionId),
        selectedOptionId: Number(optionId),
      }));
      const r = await api.post(`/api/quizzes/${quizId}/submit`, { answers: answerList });
      setResult(r.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  }, [answers, quizId, submitting]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(prev => (prev ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-secondary)" }}>Quiz yüklənir...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <AlertCircle size={44} color="#dc2626" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ marginBottom: 8 }}>Xəta</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>{error}</p>
        <button onClick={() => router.back()} className="btn btn-primary">Geri qayıt</button>
      </div>
    </div>
  );

  // Result screen
  if (result) {
    const passed = result.passed;
    return (
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", paddingTop: 80 }}>
        <div className="card animate-fade-up" style={{ padding: 48, textAlign: "center", maxWidth: 480, width: "100%" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: passed ? "#dcfce7" : "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            {passed
              ? <Trophy size={36} color="#16a34a" />
              : <XCircle size={36} color="#dc2626" />
            }
          </div>

          <h1 style={{ fontSize: 28, marginBottom: 8 }}>
            {passed ? "Təbriklər! 🎉" : "Keçilmədi"}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            {passed ? "Quizi uğurla tamamladınız!" : "Yenidən cəhd edə bilərsiniz"}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Bal", value: `${result.score}/${result.totalPoints}` },
              { label: "Faiz", value: `${Math.round(result.percentage)}%` },
              { label: "Nəticə", value: passed ? "Keçdi" : "Keçmədi" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: "16px 8px",
                background: "var(--bg-secondary)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Answer review */}
          {result.answers && (
            <div style={{ textAlign: "left", marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Cavab baxışı</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.answers.map((a: any, i: number) => (
                  <div key={i} style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: a.correct ? "#dcfce7" : "#fef2f2",
                    border: `1px solid ${a.correct ? "#86efac" : "#fecaca"}`,
                    display: "flex", alignItems: "center", gap: 10,
                    fontSize: 13,
                  }}>
                    {a.correct
                      ? <CheckCircle size={15} color="#16a34a" />
                      : <XCircle size={15} color="#dc2626" />
                    }
                    <span style={{ color: "var(--text-primary)", flex: 1 }}>{a.questionText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>
              <ArrowLeft size={14} /> Geri
            </button>
            {!passed && (
              <button onClick={() => { setResult(null); setAnswers({}); setCurrentQ(0); }} className="btn btn-primary" style={{ flex: 1 }}>
                <RotateCcw size={14} /> Yenidən
              </button>
            )}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const current = questions[currentQ];
  const totalQ = questions.length;
  const answered = Object.keys(answers).length;
  const progress = (currentQ / totalQ) * 100;

  return (
    <div className="page" style={{ paddingTop: 80, minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 50,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "12px 0",
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{quiz.title}</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {currentQ + 1} / {totalQ} sual • {answered} cavablandı
              </p>
            </div>
            {timeLeft !== null && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                background: timeLeft < 60 ? "#fef2f2" : "var(--bg-secondary)",
                border: `1px solid ${timeLeft < 60 ? "#fecaca" : "var(--border)"}`,
              }}>
                <Clock size={15} color={timeLeft < 60 ? "#dc2626" : "var(--accent)"} />
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "Syne, sans-serif", color: timeLeft < 60 ? "#dc2626" : "var(--text-primary)" }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ paddingTop: 80 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {current && (
            <div className="animate-fade-up">
              <div className="card" style={{ padding: 36, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--accent)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif",
                  }}>
                    {currentQ + 1}
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: "var(--text-primary)", paddingTop: 6 }}>
                    {current.questionText}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {current.options?.map((opt: any) => {
                    const selected = answers[current.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setAnswers({ ...answers, [current.id]: opt.id })}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 18px", borderRadius: 10, textAlign: "left",
                          border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          background: selected ? "var(--accent-soft)" : "var(--bg-secondary)",
                          cursor: "pointer", transition: "all 0.15s ease",
                          fontSize: 14, color: selected ? "var(--accent)" : "var(--text-primary)",
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          background: selected ? "var(--accent)" : "transparent",
                          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}>
                          {selected && <Check size={11} color="white" />}
                        </div>
                        {opt.optionText}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                <button
                  onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="btn btn-secondary"
                  style={{ opacity: currentQ === 0 ? 0.4 : 1 }}
                >
                  <ArrowLeft size={15} /> Əvvəlki
                </button>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                  {questions.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `2px solid ${i === currentQ ? "var(--accent)" : answers[questions[i]?.id] ? "var(--accent)" : "var(--border)"}`,
                        background: i === currentQ ? "var(--accent)" : answers[questions[i]?.id] ? "var(--accent-soft)" : "var(--bg-secondary)",
                        color: i === currentQ ? "white" : answers[questions[i]?.id] ? "var(--accent)" : "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {currentQ < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentQ(q => Math.min(totalQ - 1, q + 1))}
                    className="btn btn-primary"
                  >
                    Növbəti <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ background: "#16a34a", border: "none" }}
                  >
                    {submitting ? "Göndərilir..." : <><CheckCircle size={15} /> Bitir</>}
                  </button>
                )}
              </div>

              {/* Submit all */}
              {answered === totalQ && currentQ < totalQ - 1 && (
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ background: "#16a34a", border: "none", padding: "12px 32px" }}
                  >
                    {submitting ? "Göndərilir..." : <><CheckCircle size={15} /> Bütün cavabları göndər</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
