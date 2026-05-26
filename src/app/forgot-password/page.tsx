"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { GraduationCap, Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({ email: z.string().email("Düzgün email daxil edin") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/forgot-password", { email: data.email });
      setSent(true);
    } catch (e: any) {
      setError(e.response?.data?.error || "Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      {/* Blobs */}
      <div style={{ position: "fixed", top: 80, right: "8%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 80, left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,110,232,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div className="card animate-fade-up" style={{ width: "100%", maxWidth: 460, padding: "40px 36px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 40, height: 40, background: "var(--accent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={22} color="white" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)" }}>
              Edu<span style={{ color: "var(--accent)" }}>Flow</span>
            </span>
          </Link>
        </div>

        {!sent ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Mail size={26} color="var(--accent)" />
              </div>
              <h1 style={{ fontSize: 26, marginBottom: 8 }}>Şifrəni unutdun?</h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Email ünvanını daxil et. Şifrə sıfırlama linkini göndərəcəyik.
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 9, marginBottom: 20, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Email ünvanı
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    {...register("email")}
                    className="input"
                    type="email"
                    placeholder="email@numune.com"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                {errors.email && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: "center", fontSize: 15, padding: "13px", marginTop: 4 }}>
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Göndərilir...</> : "Sıfırlama linki göndər"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}>
                <ArrowLeft size={14} /> Girişə qayıt
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 0 12px rgba(22,163,74,0.1)" }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>Email göndərildi!</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28 }}>
              <strong style={{ color: "var(--text-primary)" }}>{getValues("email")}</strong> ünvanına şifrə sıfırlama linki göndərdik. Spam qovluğunu da yoxla.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setSent(false)} className="btn btn-secondary" style={{ justifyContent: "center", fontSize: 14 }}>
                Başqa email ilə cəhd et
              </button>
              <Link href="/login" className="btn btn-primary" style={{ justifyContent: "center", fontSize: 14 }}>
                Girişə qayıt
              </Link>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
