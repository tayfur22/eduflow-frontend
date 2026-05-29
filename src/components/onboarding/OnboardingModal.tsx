"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Code, Palette, TrendingUp, Globe, Music, Sparkles, ArrowRight, Check } from "lucide-react";

const CATEGORIES = [
  { id: "programming", label: "Proqramlaşdırma", icon: Code, color: "#3b82f6" },
  { id: "design", label: "Dizayn", icon: Palette, color: "#ec4899" },
  { id: "business", label: "Biznes", icon: TrendingUp, color: "#f59e0b" },
  { id: "language", label: "Dil", icon: Globe, color: "#10b981" },
  { id: "music", label: "Musiqi", icon: Music, color: "#8b5cf6" },
  { id: "general", label: "Ümumi", icon: BookOpen, color: "#e8541a" },
];

const GOALS = [
  { id: "career", label: "Karyera dəyişikliyi" },
  { id: "skill", label: "Bacarıq artırım" },
  { id: "hobby", label: "Hobbi olaraq" },
  { id: "freelance", label: "Freelance işi" },
];

type Step = 1 | 2 | 3;

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("onboardingDone");
      if (!done) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      localStorage.setItem("onboardingDone", "true");
    }, 300);
  };

  const handleFinish = () => {
    localStorage.setItem("onboardingDone", "true");
    localStorage.setItem("onboardingData", JSON.stringify({ goal: selectedGoal, categories: selectedCategories }));
    handleClose();
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
          width: "100%", maxWidth: 520,
          overflow: "hidden",
          transform: closing ? "scale(0.95) translateY(20px)" : "scale(1) translateY(0)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: "var(--border)" }}>
          <div style={{
            height: "100%",
            background: "var(--accent)",
            width: `${(step / 3) * 100}%`,
            transition: "width 0.4s ease",
            borderRadius: 3,
          }} />
        </div>

        {/* Header */}
        <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s === step ? 20 : 8, height: 8, borderRadius: 100,
                background: s <= step ? "var(--accent)" : "var(--border)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
          <button onClick={handleClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "var(--bg-secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)",
          }}>
            <X size={15} />
          </button>
        </div>

        {/* Step 1 - Goal */}
        {step === 1 && (
          <div style={{ padding: "20px 28px 28px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "var(--accent-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <Sparkles size={22} color="var(--accent)" />
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 6 }}>Xoş gəlmisiniz! 👋</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                Sizə ən uyğun kursları tövsiyə etmək üçün bir neçə sual verək.
              </p>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Nə öyrənmək istəyirsiniz?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 10, border: "1.5px solid",
                    borderColor: selectedGoal === g.id ? "var(--accent)" : "var(--border)",
                    background: selectedGoal === g.id ? "var(--accent-soft)" : "var(--bg-secondary)",
                    cursor: "pointer", transition: "all 0.15s ease",
                    color: selectedGoal === g.id ? "var(--accent)" : "var(--text-primary)",
                    fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  <span>{g.label}</span>
                  {selectedGoal === g.id && (
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedGoal && setStep(2)}
              disabled={!selectedGoal}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 20, opacity: selectedGoal ? 1 : 0.5 }}
            >
              İrəli <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 - Categories */}
        {step === 2 && (
          <div style={{ padding: "20px 28px 28px" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, marginBottom: 6 }}>Kateqoriya seçin</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Bir və ya bir neçə kateqoriya seçə bilərsiniz
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      padding: "16px 10px", borderRadius: 12,
                      border: `1.5px solid ${selected ? cat.color : "var(--border)"}`,
                      background: selected ? `${cat.color}15` : "var(--bg-secondary)",
                      cursor: "pointer", transition: "all 0.15s ease",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      fontFamily: "DM Sans, sans-serif",
                      position: "relative",
                    }}
                  >
                    {selected && (
                      <div style={{
                        position: "absolute", top: 6, right: 6,
                        width: 16, height: 16, borderRadius: "50%",
                        background: cat.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Check size={10} color="white" />
                      </div>
                    )}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: selected ? cat.color : "var(--bg-card)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}>
                      <Icon size={18} color={selected ? "white" : cat.color} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: selected ? cat.color : "var(--text-secondary)" }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                Geri
              </button>
              <button
                onClick={() => selectedCategories.length > 0 && setStep(3)}
                disabled={selectedCategories.length === 0}
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: "center", opacity: selectedCategories.length > 0 ? 1 : 0.5 }}
              >
                İrəli <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Recommendations */}
        {step === 3 && (
          <div style={{ padding: "20px 28px 28px" }}>
            <div style={{ textAlign: "center", paddingBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #f0a060)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 24px rgba(232,84,26,0.3)",
              }}>
                <Sparkles size={28} color="white" />
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>Hazırsınız! 🎉</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
                Seçimlərinizə əsasən sizin üçün fərdi kurs tövsiyələri hazırladıq.
              </p>
            </div>

            <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Seçimləriniz
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedCategories.map(id => {
                  const cat = CATEGORIES.find(c => c.id === id);
                  if (!cat) return null;
                  return (
                    <span key={id} style={{
                      padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: `${cat.color}15`, color: cat.color,
                      border: `1px solid ${cat.color}40`,
                    }}>{cat.label}</span>
                  );
                })}
              </div>
            </div>

            <button onClick={handleFinish} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "13px 20px" }}>
              Kurslara bax <ArrowRight size={16} />
            </button>
            <button onClick={handleFinish} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8, fontSize: 13 }}>
              Sonraya qoy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
