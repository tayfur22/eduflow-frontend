"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Send, Sparkles, Loader2, BookOpen, Zap, MessageSquare } from "lucide-react";

const SUGGESTIONS = [
  "Java-da OOP nədir?",
  "Inheritance ilə Composition fərqi nədir?",
  "Spring Boot nə üçün istifadə olunur?",
  "SQL JOIN növlərini izah et",
  "React useState hook necə işləyir?",
];

export default function AiTutorPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const r = await api.post("/api/ai/tutor", { question: q });
      setMessages(prev => [...prev, { role: "ai", text: r.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Xəta baş verdi. Yenidən cəhd edin." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page" style={{ paddingTop: 64, display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "16px 24px",
        background: "var(--bg-card)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, var(--accent), #e8741a)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={18} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: 16 }}>AI Tutor</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>İstənilən mövzuda sual ver</p>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {messages.length === 0 && (
            <div className="animate-fade-up" style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                border: "1px solid var(--border)",
              }}>
                <Sparkles size={32} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>AI Tutor ilə öyrən</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                Proqramlaşdırma, riyaziyyat, dil öyrənmə — istənilən mövzuda sual ver
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="btn btn-secondary" style={{ fontSize: 13 }}>
                    <Zap size={13} color="var(--accent)" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              {m.role === "ai" && (
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg, var(--accent), #e8741a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginRight: 10, alignSelf: "flex-end",
                }}>
                  <Sparkles size={14} color="white" />
                </div>
              )}
              <div style={{
                maxWidth: "75%",
                padding: "12px 18px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: m.role === "user" ? "var(--accent)" : "var(--bg-card)",
                border: m.role === "ai" ? "1px solid var(--border)" : "none",
                color: m.role === "user" ? "white" : "var(--text-primary)",
                fontSize: 14,
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                boxShadow: "var(--shadow-sm)",
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, var(--accent), #e8741a)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={14} color="white" />
              </div>
              <div style={{
                padding: "12px 18px", borderRadius: "4px 18px 18px 18px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "var(--accent)",
                    animation: "pulse-soft 1.2s ease infinite",
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid var(--border)",
        padding: "16px 24px",
        background: "var(--bg-card)",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            className="input"
            placeholder="Sualını yaz... (Enter ilə göndər)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ padding: "0 20px", flexShrink: 0 }}
          >
            {loading ? <Loader2 size={16} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
