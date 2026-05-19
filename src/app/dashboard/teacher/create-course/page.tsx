"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useLangStore } from "@/store/langStore";
import { BookOpen, DollarSign, Key, Zap, ArrowLeft, Plus } from "lucide-react";

export default function CreateCoursePage() {
  const router = useRouter();
  const { t } = useLangStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    accessType: "FREE",
    price: "",
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Kurs adı daxil edin");
    setLoading(true);
    setError("");
    try {
      await api.post("/api/courses", {
        title: form.title,
        description: form.description,
        accessType: form.accessType,
        price: form.accessType === "PAID" ? Number(form.price) : null,
      });
      router.push("/dashboard/teacher");
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const accessOptions = [
    { value: "FREE", label: "Pulsuz", icon: Zap, desc: "Hər kəs görə bilər" },
    { value: "PAID", label: "Ödənişli", icon: DollarSign, desc: "Ödəniş lazımdır" },
    { value: "CODE_REQUIRED", label: "Kodla", icon: Key, desc: "Giriş kodu lazımdır" },
  ];

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 12px", marginBottom: 20, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Geri qayıt
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, marginBottom: 4 }}>Yeni kurs yarat</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Kurs məlumatlarını doldurun</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 680 }}>
          <div className="card animate-fade-up" style={{ padding: 36, display: "flex", flexDirection: "column", gap: 24 }}>

            {error && (
              <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                Kurs adı *
              </label>
              <input
                className="input"
                placeholder="məs: Java-dan Sıfırdan Başlayanlar üçün"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ fontSize: 15 }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                Açıqlama
              </label>
              <textarea
                className="input"
                placeholder="Kurs haqqında ətraflı məlumat yazın. Şagirdlər bu məlumatı görəcək..."
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Access Type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 12 }}>
                Giriş növü
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {accessOptions.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, accessType: value })}
                    style={{
                      padding: "14px 12px",
                      borderRadius: 10,
                      border: `2px solid ${form.accessType === value ? "var(--accent)" : "var(--border)"}`,
                      background: form.accessType === value ? "var(--accent-soft)" : "var(--bg-secondary)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <Icon size={18} color={form.accessType === value ? "var(--accent)" : "var(--text-muted)"} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.accessType === value ? "var(--accent)" : "var(--text-primary)", marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            {form.accessType === "PAID" && (
              <div className="animate-fade-in">
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                  Qiymət (AZN)
                </label>
                <div style={{ position: "relative", maxWidth: 200 }}>
                  <DollarSign size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    className="input"
                    type="number"
                    placeholder="məs: 20"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ paddingLeft: 38 }}
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>
                Ləğv et
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Yaradılır...
                  </span>
                ) : (
                  <><Plus size={16} /> Kurs yarat</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
