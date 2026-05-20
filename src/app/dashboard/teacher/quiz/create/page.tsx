"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ClipboardList, Plus, X, Check, Loader2, ArrowLeft,
  Trash2, ChevronDown, ChevronUp
} from "lucide-react";

interface Option { text: string; correct: boolean; }
interface Question { questionText: string; points: number; options: Option[]; }

function CreateQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    courseId: searchParams.get("courseId") || "",
    timeLimit: "",
    passingScore: "60",
    maxAttempts: "1",
  });
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", points: 10, options: [
      { text: "", correct: true },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
    ]},
  ]);
  const [saving, setSaving] = useState(false);
  const [openQ, setOpenQ] = useState<number[]>([0]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/courses/my").then(r => setCourses(r.data)).catch(() => {});
  }, [user]);

  const addQuestion = () => {
    const newQ: Question = {
      questionText: "",
      points: 10,
      options: [
        { text: "", correct: true },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    };
    setQuestions(prev => [...prev, newQ]);
    setOpenQ(prev => [...prev, questions.length]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== qi));
    setOpenQ(prev => prev.filter(i => i !== qi).map(i => i > qi ? i - 1 : i));
  };

  const updateQuestion = (qi: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi: number, oi: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const opts = q.options.map((o, j) => {
        if (field === "correct") return { ...o, correct: j === oi };
        return j === oi ? { ...o, [field]: value } : o;
      });
      return { ...q, options: opts };
    }));
  };

  const totalPoints = questions.reduce((a, q) => a + q.points, 0);

  const save = async () => {
    if (!form.title.trim() || !form.courseId) return alert("Başlıq və kurs seçin");
    if (questions.some(q => !q.questionText.trim())) return alert("Bütün sualları doldurun");
    if (questions.some(q => q.options.some(o => !o.text.trim()))) return alert("Bütün variantları doldurun");

    setSaving(true);
    try {
      const quizRes = await api.post(`/api/courses/${form.courseId}/quizzes`, {
        title: form.title,
        timeLimit: form.timeLimit ? Number(form.timeLimit) : null,
        passingScore: Number(form.passingScore),
        maxAttempts: Number(form.maxAttempts),
      });
      const quizId = quizRes.data.id;

      for (const q of questions) {
        await api.post(`/api/quizzes/${quizId}/questions`, {
          questionText: q.questionText,
          points: q.points,
          options: q.options.map(o => ({ optionText: o.text, correct: o.correct })),
        });
      }

      router.push(`/dashboard/teacher`);
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "32px 0" }}>
        <div className="container">
          <button onClick={() => router.back()} className="btn btn-ghost"
            style={{ fontSize: 13, padding: "6px 12px", marginBottom: 16, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Geri
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: 26, marginBottom: 4 }}>Manual Quiz yarat</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  {questions.length} sual · {totalPoints} bal
                </p>
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn btn-primary" style={{ fontSize: 14 }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Check size={16} /> Quizi Saxla</>}
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="card animate-fade-up" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>Quiz parametrləri</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Quiz adı *
                </label>
                <input className="input" placeholder="məs: Java OOP Yekun Testi"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Kurs *
                </label>
                <select className="input" value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}>
                  <option value="">Kurs seçin...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Vaxt limiti (dəq) <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(boş = limitsiz)</span>
                </label>
                <input className="input" type="number" placeholder="məs: 30"
                  value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: e.target.value })} min="1" />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Keçid balı (%)
                </label>
                <input className="input" type="number" placeholder="60"
                  value={form.passingScore} onChange={e => setForm({ ...form, passingScore: e.target.value })}
                  min="0" max="100" />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Maksimum cəhd sayı
                </label>
                <input className="input" type="number" placeholder="1"
                  value={form.maxAttempts} onChange={e => setForm({ ...form, maxAttempts: e.target.value })}
                  min="1" max="10" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 18 }}>Suallar</h3>
            <button onClick={addQuestion} className="btn btn-secondary" style={{ fontSize: 13 }}>
              <Plus size={15} /> Sual əlavə et
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {questions.map((q, qi) => (
              <div key={qi} className="card animate-fade-up" style={{ overflow: "hidden", animationDelay: `${qi * 0.04}s`, opacity: 0 }}>
                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12, cursor: "pointer" }}
                  onClick={() => setOpenQ(prev => prev.includes(qi) ? prev.filter(i => i !== qi) : [...prev, qi])}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                    {qi + 1}
                  </div>
                  <p style={{ flex: 1, fontSize: 14, color: q.questionText ? "var(--text-primary)" : "var(--text-muted)", fontWeight: q.questionText ? 500 : 400 }}>
                    {q.questionText || "Sualı daxil edin..."}
                  </p>
                  <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginRight: 8 }}>{q.points} bal</span>
                  {openQ.includes(qi) ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  {questions.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); removeQuestion(qi); }}
                      className="btn btn-ghost" style={{ padding: "4px", color: "#ef4444" }}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {openQ.includes(qi) && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "20px" }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                        Sual mətni *
                      </label>
                      <textarea className="input" placeholder="Sualı daxil edin..."
                        rows={2} value={q.questionText}
                        onChange={e => updateQuestion(qi, "questionText", e.target.value)}
                        style={{ resize: "vertical" }} />
                    </div>

                    <div style={{ marginBottom: 20, maxWidth: 160 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                        Bal
                      </label>
                      <input className="input" type="number" min="1" max="100"
                        value={q.points}
                        onChange={e => updateQuestion(qi, "points", Number(e.target.value))} />
                    </div>

                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
                      Variantlar <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(düzgünü seçin)</span>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button onClick={() => updateOption(qi, oi, "correct", true)}
                            style={{
                              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                              border: `2px solid ${opt.correct ? "var(--accent)" : "var(--border)"}`,
                              background: opt.correct ? "var(--accent)" : "transparent",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                            {opt.correct && <Check size={12} color="white" />}
                          </button>
                          <input className="input" placeholder={`${["A", "B", "C", "D"][oi]} variantı...`}
                            value={opt.text}
                            onChange={e => updateOption(qi, oi, "text", e.target.value)}
                            style={{ border: opt.correct ? "1px solid var(--accent)" : undefined, flex: 1 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "20px 24px", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{questions.length}</span> sual ·{" "}
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>{totalPoints}</span> bal ·{" "}
              Keçid: <span style={{ fontWeight: 700 }}>{form.passingScore}%</span>
            </div>
            <button onClick={save} disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Check size={16} /> Quizi Saxla</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense fallback={
      <div className="page" style={{ paddingTop: 80 }}>
        <div className="container section">
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 120, marginBottom: 14 }} />)}
        </div>
      </div>
    }>
      <CreateQuizContent />
    </Suspense>
  );
}
