"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    accessType: "FREE",
    price: "",
  });

  const handleSubmit = async () => {
    if (!form.title) return alert("Başlıq daxil et");
    setLoading(true);
    try {
      await api.post("/api/courses", {
        title: form.title,
        description: form.description,
        accessType: form.accessType,
        price: form.accessType === "PAID" ? Number(form.price) : null,
      });
      router.push("/dashboard/teacher");
    } catch (e) {
      alert("Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="section">
        <div className="container" style={{ maxWidth: 600 }}>
          <h1 style={{ marginBottom: 8 }}>Yeni kurs yarat</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            Kurs məlumatlarını daxil edin
          </p>

          <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Başlıq */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                Kurs adı *
              </label>
              <input
                className="input"
                placeholder="məs: Java-dan Sıfırdan"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Açıqlama */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                Açıqlama
              </label>
              <textarea
                className="input"
                placeholder="Kurs haqqında qısa məlumat..."
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Access type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                Giriş növü
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { value: "FREE", label: "Pulsuz" },
                  { value: "PAID", label: "Ödənişli" },
                  { value: "CODE_REQUIRED", label: "Kodla" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, accessType: opt.value })}
                    className="btn"
                    style={{
                      flex: 1, fontSize: 13, padding: "10px",
                      background: form.accessType === opt.value ? "var(--accent)" : "var(--bg-secondary)",
                      color: form.accessType === opt.value ? "white" : "var(--text-secondary)",
                      border: `1px solid ${form.accessType === opt.value ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Qiymət */}
            {form.accessType === "PAID" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                  Qiymət (AZN)
                </label>
                <input
                  className="input"
                  type="number"
                  placeholder="məs: 20"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={() => router.back()}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Ləğv et
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? "Yaradılır..." : "Kurs yarat"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}