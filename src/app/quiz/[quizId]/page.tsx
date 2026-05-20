"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Timer, CheckCircle, XCircle, Award, ArrowRight,
  AlertCircle, Loader2, BookOpen, Check
} from "lucide-react";

export default function QuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get(`/api/quizzes/${quizId}/start`)
      .then(r => {
        setQuiz(r.data);
        if (r.data.timeLimit) setTimeLeft(r.data.timeLimit * 60);
      })
      .catch(() => router.back())
      .finally(() => setLoading(false));
  }, [quizId, user]);

  // Timer
  useEffect(() => {
    if (!started || timeLeft === null || timeLeft <= 0 || result) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, timeLeft, result]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          selectedOptionId: Number(optionId),
        })),
      };
      const r = await api.post(`/api/quizzes/${quizId}/submit`, payload);
      setResult(r.data);
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  }, [answers, quizId, submitting, result]);

  const selectOption = (questionId: number, optionId: number) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section" style={{ maxWidth: 700 }}>
        {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 120, marginBottom: 14 }} />)}
      </div>
    </div>
  );

  if (!quiz) return null;

  // Start screen
  if (!started) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section" style={{ maxWidth: 560 }}>
        <div className="card animate-fade-up" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <BookOpen size={32} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>{quiz.title}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32 }}>Quiz başlamağa hazırsınız?</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 36 }}>
            {[
              { label: "Sual sayı", value: totalQuestions },
              { label: "Vaxt limiti", value: quiz.timeLimit ? `${quiz.timeLimit} dəq` : "Limitsiz" },
              { label: "Keçid balı", value: `${quiz.passingScore}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setStarted(true)} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 16 }}>
            Başla <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Result screen
  if (result) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section" style={{ maxWidth: 640 }}>
        <div className="card animate-fade-up" style={{ padding: 48, textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: result.passed ? "#dcfce7" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            {result.passed
              ? <Award size={36} color="#16a34a" />
              : <XCircle size={36} color="#dc2626" />
            }
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>{result.passed ? "Keçdiniz! 🎉" : "Keçmediniz"}</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            {result.passed ? "Təbriklər! Quiz-i uğurla tamamladınız." : "Daha çox öyrənib yenidən cəhd edin."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 36 }}>
            {[
              { label: "Bal", value: `${Math.round(result.percentage)}%`, color: result.passed ? "#16a34a" : "#dc2626" },
              { label: "Düzgün", value: result.correctAnswers, color: "#16a34a" },
              { label: "Yanlış", value: result.wrongAnswers, color: "#dc2626" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Syne, sans-serif", color }}>{value}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => router.back()} className="btn btn-primary" style={{ justifyContent: "center", padding: "12px 32px" }}>
            Geri qayıt
          </button>
        </div>

        {/* Answer review */}
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Cavabların baxışı</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.answerResults?.map((ar: any, i: number) => (
            <div key={i} className="card" style={{ padding: 20, borderLeft: `3px solid ${ar.correct ? "#16a34a" : "#dc2626"}` }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                {ar.correct ? <CheckCircle size={17} color="#16a34a" /> : <XCircle size={17} color="#dc2626" />}
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{ar.questionText}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                <div style={{ padding: "8px 12px", borderRadius: 6, background: "#dcfce7", color: "#15803d" }}>
                  ✓ Düzgün: {ar.correctOptionText}
                </div>
                {!ar.correct && ar.selectedOptionText && (
                  <div style={{ padding: "8px 12px", borderRadius: 6, background: "#fef2f2", color: "#dc2626" }}>
                    ✗ Seçdiyiniz: {ar.selectedOptionText}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Quiz screen
  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 64, zIndex: 50, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{quiz.title}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {answeredCount}/{totalQuestions} cavablandı
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {timeLeft !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: timeLeft < 60 ? "#fef2f2" : "var(--bg-secondary)", border: `1px solid ${timeLeft < 60 ? "#fecaca" : "var(--border)"}` }}>
                <Timer size={15} color={timeLeft < 60 ? "#dc2626" : "var(--accent)"} />
                <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: timeLeft < 60 ? "#dc2626" : "var(--text-primary)" }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            <button onClick={handleSubmit} disabled={submitting || answeredCount === 0}
              className="btn btn-primary" style={{ fontSize: 13 }}>
              {submitting ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : "Bitir"}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 3, background: "var(--border)", marginTop: 12 }}>
          <div style={{ height: "100%", width: `${(answeredCount / totalQuestions) * 100}%`, background: "var(--accent)", transition: "width 0.3s ease" }} />
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {quiz.questions?.map((q: any, qi: number) => (
              <div key={q.id} className="card animate-fade-up" style={{ padding: 24, animationDelay: `${qi * 0.04}s`, opacity: 0 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: answers[q.id] ? "var(--accent)" : "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: answers[q.id] ? "white" : "var(--text-muted)", flexShrink: 0, border: "1px solid var(--border)", transition: "all 0.2s" }}>
                    {qi + 1}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{q.questionText}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options?.map((opt: any) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <button key={opt.id} onClick={() => selectOption(q.id, opt.id)}
                        style={{
                          padding: "12px 16px", borderRadius: 10, textAlign: "left", fontSize: 14,
                          border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          background: selected ? "var(--accent-soft)" : "var(--bg-secondary)",
                          color: selected ? "var(--accent)" : "var(--text-primary)",
                          cursor: "pointer", transition: "all 0.18s ease", fontWeight: selected ? 600 : 400,
                          display: "flex", alignItems: "center", gap: 10,
                        }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`, background: selected ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.18s" }}>
                          {selected && <Check size={11} color="white" />}
                        </div>
                        {opt.optionText}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "right" }}>
                  {q.points} bal
                </div>
              </div>
            ))}
          </div>

          {/* Bottom submit */}
          <div className="card" style={{ padding: "20px 24px", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {answeredCount < totalQuestions && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--warning)" }}>
                <AlertCircle size={14} />
                {totalQuestions - answeredCount} sual cavablanmayıb
              </div>
            )}
            {answeredCount === totalQuestions && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--success)" }}>
                <CheckCircle size={14} />
                Bütün suallar cavablandı
              </div>
            )}
            <button onClick={handleSubmit} disabled={submitting || answeredCount === 0}
              className="btn btn-primary" style={{ marginLeft: "auto" }}>
              {submitting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Quizi Bitir"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
