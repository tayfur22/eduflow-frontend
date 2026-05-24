"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  ArrowRight, ArrowLeft, Trophy, RotateCcw,
  BookOpen, Target, Zap, ChevronRight, Award
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
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get(`/api/quizzes/${quizId}/start`)
      .then(r => {
        setQuiz(r.data);
        if (r.data.timeLimitMinutes) setTimeLeft(r.data.timeLimitMinutes * 60);
      })
      .catch(() => setError("Quiz tapılmadı"))
      .finally(() => setLoading(false));
  }, [quizId, user]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answersMap: Record<string, string> = {};
      Object.entries(answers).forEach(([questionId, optionId]) => {
        const question = quiz?.questions?.find((q: any) => q.id === Number(questionId));
        const option = question?.options?.find((o: any) => o.id === Number(optionId));
        if (option?.optionLabel) answersMap[questionId] = option.optionLabel;
      });
      const r = await api.post(`/api/quizzes/${quizId}/submit`, { answers: answersMap });
      setResult(r.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  }, [answers, quizId, submitting, quiz]);

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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Quiz yüklənir...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 380 }}>
        <AlertCircle size={44} color="#dc2626" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ marginBottom: 8 }}>Xəta</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 14 }}>{error}</p>
        <button onClick={() => router.back()} className="btn btn-primary">Geri qayıt</button>
      </div>
    </div>
  );

  // ── RESULT SCREEN ──
  if (result) {
    const passed = result.passed;
    const correct = result.answers?.filter((a: any) => a.correct).length ?? 0;
    const wrong = result.answers?.filter((a: any) => !a.correct).length ?? 0;
    const pct = Math.round(result.percentage ?? 0);

    return (
      <div className="page" style={{ paddingTop: 80, minHeight: "100vh" }}>
        <div className="container" style={{ maxWidth: 680, paddingTop: 40 }}>

          {/* Score card */}
          <div className="card animate-fade-up" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            {/* BG decoration */}
            <div style={{
              position: "absolute", top: -60, right: -60, width: 240, height: 240,
              borderRadius: "50%", background: passed ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.06)",
              pointerEvents: "none",
            }} />

            {/* Progress ring placeholder */}
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: passed ? "#dcfce7" : "#fef2f2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 0 0 8px ${passed ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)"}`,
            }}>
              {passed
                ? <Trophy size={38} color="#16a34a" />
                : <RotateCcw size={34} color="#dc2626" />}
            </div>

            <h2 style={{ fontSize: 26, marginBottom: 6 }}>
              {passed ? "Keçdiniz! 🎉" : "Keçmediniz"}
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: 14 }}>
              {passed ? "Təbriklər! Quiz-i uğurla tamamladınız." : "Daha çox öyrənib yenidən cəhd edin."}
            </p>

            {/* Big score */}
            <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "Syne, sans-serif", color: passed ? "#16a34a" : "#dc2626", lineHeight: 1, marginBottom: 4 }}>
              {pct}%
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>Ümumi faiz</p>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Düzgün", value: correct, color: "#16a34a", bg: "#f0fdf4" },
                { label: "Yanlış", value: wrong, color: "#dc2626", bg: "#fef2f2" },
                { label: "Ümumi", value: correct + wrong, color: "var(--text-primary)", bg: "var(--bg-secondary)" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ padding: "14px 10px", borderRadius: 10, background: bg, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Syne, sans-serif", color }}>{value}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => router.back()} className="btn btn-secondary" style={{ fontSize: 14 }}>
                <ArrowLeft size={14} /> Geri
              </button>
              <button onClick={() => setShowReview(!showReview)} className="btn btn-primary" style={{ fontSize: 14 }}>
                {showReview ? "İcmalı gizlət" : "Yanlışlara bax"} <ChevronRight size={14} />
              </button>
              {!passed && (
                <button
                  onClick={() => { setResult(null); setAnswers({}); setCurrentQ(0); }}
                  className="btn"
                  style={{ fontSize: 14, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                >
                  <RotateCcw size={14} /> Yenidən
                </button>
              )}
            </div>
          </div>

          {/* Answer review */}
          {showReview && (
            <div className="animate-fade-up">
              <h3 style={{ fontSize: 17, marginBottom: 14 }}>Cavabların baxışı</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.answers?.map((ar: any, i: number) => (
                  <div key={i} className="card" style={{
                    padding: 20,
                    borderLeft: `3px solid ${ar.correct ? "#16a34a" : "#dc2626"}`,
                  }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      {ar.correct
                        ? <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                        : <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />}
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{ar.questionText}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 26, fontSize: 13 }}>
                      <div style={{ padding: "7px 12px", borderRadius: 6, background: "#dcfce7", color: "#15803d" }}>
                        ✓ Düzgün cavab: <strong>{ar.correctAnswer}</strong>
                      </div>
                      {!ar.correct && ar.givenAnswer && (
                        <div style={{ padding: "7px 12px", borderRadius: 6, background: "#fef2f2", color: "#dc2626" }}>
                          ✗ Seçdiyiniz: <strong>{ar.givenAnswer}</strong>
                        </div>
                      )}
                      {ar.explanation && (
                        <div style={{ padding: "7px 12px", borderRadius: 6, background: "var(--bg-secondary)", color: "var(--text-secondary)", borderLeft: "3px solid var(--accent)" }}>
                          💡 {ar.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  const progressPct = totalQ > 0 ? ((currentQ + 1) / totalQ) * 100 : 0;
  const isUrgent = timeLeft !== null && timeLeft < 60;

  return (
    <div className="page" style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg-secondary)" }}>
      {/* ── TOP BAR ── */}
      <div style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 50,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0",
      }}>
        {/* Progress bar (very top) */}
        <div style={{ height: 3, background: "var(--border)" }}>
          <div style={{
            height: "100%", background: "var(--accent)",
            width: `${progressPct}%`, transition: "width 0.3s ease",
          }} />
        </div>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={14} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>{quiz.title}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Sual {currentQ + 1} / {totalQ} · {answered} cavablandı
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {timeLeft !== null && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: isUrgent ? "#fef2f2" : "var(--bg-secondary)",
                border: `1px solid ${isUrgent ? "#fecaca" : "var(--border)"}`,
                animation: isUrgent ? "urgentPulse 1s ease infinite" : "none",
              }}>
                <Clock size={13} color={isUrgent ? "#dc2626" : "var(--text-muted)"} />
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace", color: isUrgent ? "#dc2626" : "var(--text-primary)" }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting || answered === 0}
              className="btn btn-primary"
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              {submitting ? "Göndərilir..." : "Bitir"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 52 + 64, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 680 }}>

          {/* Question number dots (compact) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24, justifyContent: "center" }}>
            {questions.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                style={{
                  width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: `2px solid ${i === currentQ ? "var(--accent)" : answers[questions[i]?.id] ? "#16a34a" : "var(--border)"}`,
                  background: i === currentQ ? "var(--accent)" : answers[questions[i]?.id] ? "#dcfce7" : "var(--bg-card)",
                  color: i === currentQ ? "white" : answers[questions[i]?.id] ? "#15803d" : "var(--text-muted)",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* ── QUESTION CARD ── */}
          {current && (
            <div key={currentQ} className="animate-fade-up">
              <div className="card" style={{ padding: "28px 28px 24px", marginBottom: 14 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0, fontFamily: "Syne, sans-serif",
                  }}>
                    {currentQ + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    {quiz.difficultyLevel && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                        background: "var(--accent-soft)", color: "var(--accent)",
                        marginBottom: 8, display: "inline-block", letterSpacing: "0.05em",
                      }}>
                        {quiz.difficultyLevel}
                      </span>
                    )}
                    <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {current.questionText}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{current.points} bal</p>
                  </div>
                </div>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {current.options?.map((opt: any) => {
                    const selected = answers[current.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setAnswers({ ...answers, [current.id]: opt.id })}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "13px 16px", borderRadius: 10, textAlign: "left",
                          border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          background: selected ? "var(--accent-soft)" : "var(--bg-secondary)",
                          cursor: "pointer", transition: "all 0.15s ease",
                          color: selected ? "var(--accent)" : "var(--text-primary)",
                          fontWeight: selected ? 600 : 400, fontSize: 14,
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          background: selected ? "var(--accent)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700,
                          color: selected ? "white" : "var(--text-muted)",
                          transition: "all 0.15s ease",
                        }}>
                          {selected ? <CheckCircle size={11} color="white" /> : opt.optionLabel}
                        </div>
                        {opt.optionText}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="btn btn-secondary"
                  style={{ opacity: currentQ === 0 ? 0.4 : 1, fontSize: 14 }}
                >
                  <ArrowLeft size={14} /> Əvvəlki
                </button>

                {currentQ < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentQ(q => Math.min(totalQ - 1, q + 1))}
                    className="btn btn-primary"
                    style={{ fontSize: 14 }}
                  >
                    Növbəti <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn"
                    style={{ fontSize: 14, background: "#16a34a", color: "white", border: "none" }}
                  >
                    {submitting ? "Göndərilir..." : <><CheckCircle size={14} /> Quizi Bitir</>}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit all if all answered */}
          {answered === totalQ && currentQ < totalQ - 1 && (
            <div className="card" style={{ padding: "16px 20px", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#16a34a" }}>
                <CheckCircle size={15} />
                Bütün {totalQ} sual cavablandı!
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn"
                style={{ fontSize: 13, background: "#16a34a", color: "white", border: "none" }}
              >
                {submitting ? "..." : "Göndər"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes urgentPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}
