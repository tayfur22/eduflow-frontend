"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Key, Plus, X, Copy, Check, Power, ArrowLeft,
  Loader2, Calendar, Users, AlertCircle
} from "lucide-react";

export default function AccessCodesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [codes, setCodes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    courseId: searchParams.get("courseId") || "",
    code: "",
    maxUsages: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "TEACHER") { router.push("/dashboard/student"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [codesRes, coursesRes] = await Promise.all([
        api.get("/api/access-codes/my"),
        api.get("/api/courses/my"),
      ]);
      setCodes(codesRes.data);
      setCourses(coursesRes.data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, code }));
  };

  const createCode = async () => {
    if (!form.courseId || !form.code) return;
    setCreating(true);
    try {
      await api.post("/api/access-codes", {
        courseId: Number(form.courseId),
        code: form.code.toUpperCase(),
        maxUsages: form.maxUsages ? Number(form.maxUsages) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      setShowModal(false);
      setForm({ courseId: "", code: "", maxUsages: "", expiresAt: "" });
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setCreating(false);
    }
  };

  const deactivate = async (codeId: number) => {
    if (!confirm("Bu kodu deaktiv etmək istəyirsiniz?")) return;
    await api.patch(`/api/access-codes/${codeId}/deactivate`);
    loadData();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCourseName = (courseId: number) =>
    courses.find(c => c.id === courseId)?.title || "Naməlum kurs";

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 80, marginBottom: 12 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container">
          <button onClick={() => router.back()} className="btn btn-ghost"
            style={{ fontSize: 13, padding: "6px 12px", marginBottom: 20, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Geri
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Key size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: 26, marginBottom: 4 }}>Giriş kodları</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{codes.length} kod yaradılıb</p>
              </div>
            </div>
            <button onClick={() => { generateCode(); setShowModal(true); }} className="btn btn-primary">
              <Plus size={16} /> Yeni kod
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {codes.length === 0 ? (
            <div className="card" style={{ padding: "60px", textAlign: "center" }}>
              <Key size={44} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Hələ kod yaradılmayıb</p>
              <button onClick={() => { generateCode(); setShowModal(true); }} className="btn btn-primary">
                <Plus size={15} /> İlk kodu yarat
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {codes.map((code, i) => (
                <div key={code.id} className="card animate-fade-up"
                  style={{ padding: 22, animationDelay: `${i * 0.05}s`, opacity: 0, borderLeft: `3px solid ${code.active ? "var(--accent)" : "var(--border)"}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontFamily: "monospace", fontSize: 20, fontWeight: 800,
                          color: code.active ? "var(--text-primary)" : "var(--text-muted)",
                          letterSpacing: "0.08em",
                        }}>
                          {code.code}
                        </span>
                        {!code.active && (
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>
                            Deaktiv
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{getCourseName(code.courseId)}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => copyCode(code.code)} className="btn btn-ghost"
                        style={{ padding: "6px", borderRadius: 8, width: 32, height: 32, justifyContent: "center" }}
                        title="Kopyala">
                        {copied === code.code ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      </button>
                      {code.active && (
                        <button onClick={() => deactivate(code.id)} className="btn btn-ghost"
                          style={{ padding: "6px", borderRadius: 8, width: 32, height: 32, justifyContent: "center", color: "#ef4444" }}
                          title="Deaktiv et">
                          <Power size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} />
                      {code.currentUsages}{code.maxUsages ? `/${code.maxUsages}` : ""} istifadə
                    </span>
                    {code.expiresAt && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} />
                        {new Date(code.expiresAt).toLocaleDateString("az-AZ")}
                      </span>
                    )}
                  </div>

                  {code.maxUsages && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.min((code.currentUsages / code.maxUsages) * 100, 100)}%`,
                          background: code.currentUsages >= code.maxUsages ? "#ef4444" : "var(--accent)",
                          borderRadius: 2, transition: "width 0.3s ease",
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="card animate-fade-up" style={{ width: "100%", maxWidth: 500, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Yeni giriş kodu</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Course */}
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

              {/* Code */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Kod *
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="məs: JAVA2024"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    style={{ flex: 1, fontFamily: "monospace", fontSize: 15, letterSpacing: "0.05em" }} />
                  <button onClick={generateCode} className="btn btn-secondary" style={{ flexShrink: 0, fontSize: 12 }}>
                    Yenilə
                  </button>
                </div>
              </div>

              {/* Max usages */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Maksimum istifadə sayı <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(boş = limitsiz)</span>
                </label>
                <input className="input" type="number" placeholder="məs: 30"
                  value={form.maxUsages}
                  onChange={e => setForm({ ...form, maxUsages: e.target.value })} min="1" />
              </div>

              {/* Expires at */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Bitmə tarixi <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(boş = limitsiz)</span>
                </label>
                <input className="input" type="datetime-local"
                  value={form.expiresAt}
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Ləğv et</button>
              <button onClick={createCode} disabled={creating || !form.courseId || !form.code}
                className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                {creating ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <><Key size={15} /> Yarat</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
