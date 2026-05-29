"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  GraduationCap, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, ArrowLeft,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Token tapılmadı. Yenidən şifrə sıfırlama linki tələb edin.");
  }, [token]);

  const strength = (() => {
    const checks = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ];
    return checks.filter(Boolean).length;
  })();
  const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#16a34a"];
  const strengthLabels = ["Zəif", "Orta", "Yaxşı", "Güclü"];

  const handleSubmit = async () => {
    if (!token) return;
    if (newPassword.length < 6) {
      setError("Şifrə ən az 6 simvol olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (e: any) {
      setError(e.response?.data?.error || "Token etibarsızdır və ya müddəti keçib. Yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-secondary)", padding: "40px 24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
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

        {success ? (
          /* Success state */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%",
              background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", boxShadow: "0 0 0 12px rgba(22,163,74,0.1)",
            }}>
              <CheckCircle size={34} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 10 }}>Şifrə dəyişdirildi!</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
              Şifrəniz uğurla yeniləndi. 3 saniyə sonra giriş səhifəsinə yönləndirilirsiniz...
            </p>
            <Link href="/login" className="btn btn-primary" style={{ justifyContent: "center", textDecoration: "none" }}>
              Girişə keç →
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: "var(--accent-soft)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
              }}>
                <Lock size={26} color="var(--accent)" />
              </div>
              <h1 style={{ fontSize: 24, marginBottom: 8 }}>Yeni şifrə təyin edin</h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Güclü bir şifrə seçin və yadda saxlayın.
              </p>
            </div>

            {error && (
              <div style={{
                padding: "12px 14px", background: "#fef2f2",
                border: "1px solid #fca5a5", borderRadius: 9,
                marginBottom: 20, fontSize: 13, color: "#dc2626",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* New password */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Yeni şifrə
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Ən az 6 simvol"
                    className="input"
                    style={{ paddingRight: 40 }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength meter */}
                {newPassword.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? strengthColors[strength - 1] : "var(--border)",
                          transition: "background 0.2s",
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: strengthColors[strength - 1] || "var(--text-muted)" }}>
                      Güc: {strengthLabels[strength - 1] || "Çox zəif"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 7 }}>
                  Şifrəni təsdiqlə
                </label>
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Şifrəni təkrar daxil edin"
                  className="input"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{
                    borderColor: confirmPassword.length > 0
                      ? (confirmPassword === newPassword ? "#16a34a" : "#ef4444")
                      : undefined,
                  }}
                />
                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>Şifrələr uyğun gəlmir</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !token}
                className="btn btn-primary"
                style={{ justifyContent: "center", fontSize: 15, padding: "13px", marginTop: 4 }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Dəyişdirilir...</>
                  : "Şifrəni dəyiş"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}>
                <ArrowLeft size={14} /> Girişə qayıt
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Yüklənir...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
