"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ClipboardList, Plus, X, Check, Loader2, ArrowLeft,
  Trash2, ChevronDown, ChevronUp, Settings, ListChecks,
  BookOpen, Target, Timer, Hash, LayoutDashboard, AlertCircle,
  CheckCircle2, GripVertical, Star, Zap
} from "lucide-react";

interface Option { text: string; correct: boolean; }
interface Question { questionText: string; points: number; options: Option[]; }

const OPTION_LABELS = ["A", "B", "C", "D"];

type Section = "overview" | "details" | "questions" | "settings";

function CreateQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<Section>("details");
  const [form, setForm] = useState({
    title: "",
    courseId: searchParams.get("courseId") || "",
    timeLimit: "",
    passingScore: "60",
    maxAttempts: "1",
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "", points: 10, options: [
        { text: "", correct: true },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ]
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [openQ, setOpenQ] = useState<number[]>([0]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/courses/my").then(r => setCourses(r.data)).catch(() => {});
  }, [user]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: "", points: 10, options: [
        { text: "", correct: true },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ]
    }]);
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
        timeLimitMinutes: form.timeLimit ? Number(form.timeLimit) : null,
        passingScore: Number(form.passingScore),
        maxAttempts: Number(form.maxAttempts),
        shuffleQuestions: false,
      });
      const quizId = quizRes.data.id;

      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi];
        const correctIndex = q.options.findIndex(o => o.correct);
        const correctLabel = OPTION_LABELS[correctIndex] ?? "A";
        await api.post(`/api/quizzes/${quizId}/questions`, {
          questionText: q.questionText,
          questionType: "MULTIPLE_CHOICE",
          correctAnswer: correctLabel,
          points: q.points,
          orderIndex: qi + 1,
          options: q.options.map((o, oi) => ({
            optionLabel: OPTION_LABELS[oi],
            optionText: o.text,
          })),
        });
      }
      router.push(`/dashboard/teacher`);
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  const filledQuestions = questions.filter(q => q.questionText.trim()).length;
  const isDetailsComplete = form.title.trim() && form.courseId;

  const navItems: { id: Section; label: string; icon: any; badge?: string }[] = [
    { id: "overview", label: "İcmal", icon: LayoutDashboard },
    { id: "details", label: "Ümumi Detallar", icon: BookOpen, badge: !isDetailsComplete ? "!" : undefined },
    { id: "questions", label: "Suallar", icon: ListChecks, badge: String(questions.length) },
    { id: "settings", label: "Parametrlər", icon: Settings },
  ];

  return (
    <div className="page" style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 260,
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
          {/* Sidebar Header */}
          <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => router.back()} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "var(--text-muted)", background: "none",
              border: "none", cursor: "pointer", padding: "4px 0", marginBottom: 16,
            }}>
              <ArrowLeft size={13} /> Geri qayıt
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "var(--accent)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <ClipboardList size={18} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {form.title || "Yeni Quiz"}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {questions.length} sual · {totalPoints} bal
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tamamlanma</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>
                {Math.round(((isDetailsComplete ? 1 : 0) + (filledQuestions > 0 ? 1 : 0)) / 2 * 100)}%
              </span>
            </div>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2, background: "var(--accent)",
                width: `${Math.round(((isDetailsComplete ? 1 : 0) + (filledQuestions > 0 ? 1 : 0)) / 2 * 100)}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ padding: "10px 12px", flex: 1 }}>
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
                {badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 100,
                    background: badge === "!" ? "#fef2f2" : "var(--accent-soft)",
                    color: badge === "!" ? "#dc2626" : "var(--accent)",
                    minWidth: 18, textAlign: "center",
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Stats in sidebar */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: Hash, label: "Sual sayı", value: questions.length },
              { icon: Target, label: "Ümumi bal", value: totalPoints },
              { icon: Star, label: "Keçid balı", value: `${form.passingScore}%` },
              { icon: Timer, label: "Vaxt", value: form.timeLimit ? `${form.timeLimit} dəq` : "Limitsiz" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)" }}>
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: 14 }}
            >
              {saving
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saxlanır...</>
                : <><Check size={15} /> Quizi Saxla</>}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto", maxWidth: "100%" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>

            {/* ── OVERVIEW ── */}
            {activeSection === "overview" && (
              <div className="animate-fade-up">
                <h2 style={{ fontSize: 22, marginBottom: 6 }}>İcmal</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>Quiz-in ümumi vəziyyətinə baxın</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
                  {[
                    { icon: BookOpen, label: "Quiz adı", value: form.title || "—", color: "var(--accent)" },
                    { icon: Hash, label: "Suallar", value: questions.length, color: "#7c3aed" },
                    { icon: Target, label: "Toplam bal", value: totalPoints, color: "#0ea5e9" },
                    { icon: Star, label: "Keçid balı", value: `${form.passingScore}%`, color: "#f59e0b" },
                    { icon: Timer, label: "Vaxt", value: form.timeLimit ? `${form.timeLimit} dəq` : "Limitsiz", color: "#16a34a" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="card" style={{ padding: "16px 18px" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)", marginBottom: 3 }}>{value}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Checklist */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 16 }}>Yoxlama siyahısı</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { done: !!form.title.trim(), text: "Quiz adı daxil edilib", action: () => setActiveSection("details") },
                      { done: !!form.courseId, text: "Kurs seçilib", action: () => setActiveSection("details") },
                      { done: questions.length > 0, text: "Ən az 1 sual əlavə edilib", action: () => setActiveSection("questions") },
                      { done: filledQuestions === questions.length, text: "Bütün suallar doldurulub", action: () => setActiveSection("questions") },
                    ].map(({ done, text, action }) => (
                      <button key={text} onClick={action} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 8,
                        background: done ? "#f0fdf4" : "var(--bg-secondary)",
                        border: `1px solid ${done ? "#bbf7d0" : "var(--border)"}`,
                        cursor: "pointer", textAlign: "left",
                      }}>
                        {done
                          ? <CheckCircle2 size={16} color="#16a34a" />
                          : <AlertCircle size={16} color="#f59e0b" />}
                        <span style={{ fontSize: 13, color: done ? "#15803d" : "var(--text-secondary)", fontWeight: done ? 500 : 400 }}>{text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── DETAILS ── */}
            {activeSection === "details" && (
              <div className="animate-fade-up">
                <h2 style={{ fontSize: 22, marginBottom: 6 }}>Ümumi Detallar</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>Quiz-in əsas məlumatlarını daxil edin</p>

                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                        Quiz adı <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        className="input"
                        placeholder="məs: Java OOP Yekun Testi"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                        Kurs <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="input"
                        value={form.courseId}
                        onChange={e => setForm({ ...form, courseId: e.target.value })}
                      >
                        <option value="">Kurs seçin...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    onClick={() => setActiveSection("questions")}
                    className="btn btn-primary"
                    style={{ fontSize: 14 }}
                  >
                    Davam et: Suallar <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} />
                  </button>
                </div>
              </div>
            )}

            {/* ── QUESTIONS ── */}
            {activeSection === "questions" && (
              <div className="animate-fade-up">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 22, marginBottom: 4 }}>Sualların İdarə Edilməsi</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                      {filledQuestions}/{questions.length} sual doldurulub
                    </p>
                  </div>
                  <button onClick={addQuestion} className="btn btn-primary" style={{ fontSize: 13 }}>
                    <Plus size={15} /> Sual əlavə et
                  </button>
                </div>

                {/* Question progress bar */}
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginBottom: 24 }}>
                  <div style={{
                    height: "100%", borderRadius: 2, background: "var(--accent)",
                    width: `${questions.length > 0 ? (filledQuestions / questions.length) * 100 : 0}%`,
                    transition: "width 0.3s ease",
                  }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {questions.map((q, qi) => {
                    const isFilled = q.questionText.trim() && q.options.every(o => o.text.trim());
                    return (
                      <div key={qi} className="card" style={{
                        overflow: "hidden",
                        borderLeft: `3px solid ${isFilled ? "var(--accent)" : "var(--border)"}`,
                        transition: "border-color 0.2s ease",
                      }}>
                        {/* Question header */}
                        <div
                          style={{ display: "flex", alignItems: "center", padding: "14px 18px", gap: 10, cursor: "pointer" }}
                          onClick={() => setOpenQ(prev => prev.includes(qi) ? prev.filter(i => i !== qi) : [...prev, qi])}
                        >
                          <div style={{
                            width: 26, height: 26, borderRadius: 7,
                            background: isFilled ? "var(--accent)" : "var(--bg-secondary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700,
                            color: isFilled ? "white" : "var(--text-muted)",
                            flexShrink: 0, border: `1px solid ${isFilled ? "var(--accent)" : "var(--border)"}`,
                          }}>
                            {qi + 1}
                          </div>
                          <p style={{ flex: 1, fontSize: 14, color: q.questionText ? "var(--text-primary)" : "var(--text-muted)", fontWeight: q.questionText ? 500 : 400 }}>
                            {q.questionText || "Sualı daxil edin..."}
                          </p>
                          <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)" }}>
                            {q.points} bal
                          </span>
                          {openQ.includes(qi) ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                          {questions.length > 1 && (
                            <button
                              onClick={e => { e.stopPropagation(); removeQuestion(qi); }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px", borderRadius: 6, display: "flex" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {openQ.includes(qi) && (
                          <div style={{ borderTop: "1px solid var(--border)", padding: "20px 18px", background: "var(--bg-secondary)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 14, marginBottom: 18 }}>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                  Sual mətni *
                                </label>
                                <textarea
                                  className="input"
                                  placeholder="Sualı daxil edin..."
                                  rows={2}
                                  value={q.questionText}
                                  onChange={e => updateQuestion(qi, "questionText", e.target.value)}
                                  style={{ resize: "vertical" }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                  Bal
                                </label>
                                <input
                                  className="input"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={q.points}
                                  onChange={e => updateQuestion(qi, "points", Number(e.target.value))}
                                />
                              </div>
                            </div>

                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
                              Cavab variantları <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(✓ düzgün cavabı seçin)</span>
                            </label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {q.options.map((opt, oi) => (
                                <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <button
                                    onClick={() => updateOption(qi, oi, "correct", true)}
                                    style={{
                                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                      border: `2px solid ${opt.correct ? "var(--accent)" : "var(--border)"}`,
                                      background: opt.correct ? "var(--accent)" : "var(--bg-card)",
                                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 11, fontWeight: 700,
                                      color: opt.correct ? "white" : "var(--text-muted)",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {opt.correct ? <Check size={12} /> : OPTION_LABELS[oi]}
                                  </button>
                                  <input
                                    className="input"
                                    placeholder={`${OPTION_LABELS[oi]} variantı...`}
                                    value={opt.text}
                                    onChange={e => updateOption(qi, oi, "text", e.target.value)}
                                    style={{
                                      flex: 1,
                                      border: opt.correct ? "1.5px solid var(--accent)" : undefined,
                                      background: opt.correct ? "var(--accent-soft)" : undefined,
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom add */}
                <button
                  onClick={addQuestion}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 10, marginTop: 14,
                    border: "2px dashed var(--border)", background: "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, fontSize: 14, color: "var(--text-muted)", transition: "all 0.15s ease",
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
                  <Plus size={16} /> Yeni sual əlavə et
                </button>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {activeSection === "settings" && (
              <div className="animate-fade-up">
                <h2 style={{ fontSize: 22, marginBottom: 6 }}>Parametrlər</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>Quiz-in davranış parametrlərini konfiqurasiya edin</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Time Limit */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Timer size={18} color="#d97706" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Vaxt limiti</h3>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Şagirdin quizi tamamlamaq üçün vaxtı</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        className="input"
                        type="number"
                        placeholder="məs: 30"
                        value={form.timeLimit}
                        onChange={e => setForm({ ...form, timeLimit: e.target.value })}
                        min="1"
                        style={{ maxWidth: 160 }}
                      />
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>dəqiqə</span>
                      {!form.timeLimit && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 10px", borderRadius: 6, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                          Limitsiz
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passing Score */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Target size={18} color="#16a34a" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Keçid balı</h3>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Keçmək üçün tələb olunan minimum faiz</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        className="input"
                        type="number"
                        placeholder="60"
                        value={form.passingScore}
                        onChange={e => setForm({ ...form, passingScore: e.target.value })}
                        min="0"
                        max="100"
                        style={{ maxWidth: 100 }}
                      />
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>%</span>
                      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${form.passingScore}%`, background: "#16a34a", transition: "width 0.3s ease" }} />
                      </div>
                    </div>
                  </div>

                  {/* Max Attempts */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Zap size={18} color="var(--accent)" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Maksimum cəhd sayı</h3>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Şagirdin neçə dəfə cəhd edə biləcəyi</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        className="input"
                        type="number"
                        placeholder="1"
                        value={form.maxAttempts}
                        onChange={e => setForm({ ...form, maxAttempts: e.target.value })}
                        min="1"
                        max="10"
                        style={{ maxWidth: 100 }}
                      />
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>cəhd</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
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
