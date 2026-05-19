"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, BookOpen, Sparkles } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { t } = useLangStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "STUDENT" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/register", data);
      setUser(res.data);
      router.push(res.data.role === "TEACHER" ? "/dashboard/teacher" : "/dashboard/student");
    } catch (err: any) {
      setError(err.response?.data?.error || t("register_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-secondary)",
      padding: "40px 24px",
    }}>
      <div style={{
        position: "fixed", bottom: 100, left: "5%",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(26,110,232,0.06), transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div className="animate-fade-up" style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: "var(--accent)", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(232,84,26,0.3)",
          }}>
            <GraduationCap size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>{t("create_account")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {t("register_desc")}
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 8, marginBottom: 20,
            }}>
              <AlertCircle size={16} color="#dc2626" />
              <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10 }}>
              {t("select_role")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                {
                 value: "STUDENT",
                 label: t("student_role"),
                 desc: t("student_role_desc"),
                 icon: BookOpen
               },
               {
                 value: "TEACHER",
                 label: t("teacher_role"),
                 desc: t("teacher_role_desc"),
                icon: Sparkles
              },
              ].map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("role", value as "STUDENT" | "TEACHER")}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `2px solid ${selectedRole === value ? "var(--accent)" : "var(--border)"}`,
                    background: selectedRole === value ? "var(--accent-soft)" : "var(--bg-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Icon size={15} color={selectedRole === value ? "var(--accent)" : "var(--text-muted)"} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: selectedRole === value ? "var(--accent)" : "var(--text-primary)" }}>
                      {label}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Full name */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 7 }}>
                {t("full_name")}
              </label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input {...register("fullName")} type="text" placeholder="Adınız Soyadınız" className="input" style={{ paddingLeft: 38 }} />
              </div>
              {errors.fullName && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{t("name_error")}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 7 }}>
                {t("email")}
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input {...register("email")} type="email" placeholder="email@nümunə.com" className="input" style={{ paddingLeft: 38 }} />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{t("email_error")}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 7 }}>
                {t("password")}
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0,
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{t("password_error")}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite", display: "inline-block",
                  }} />
                  {t("register_loading")}
                </span>
              ) : (
                <>{t("register_btn")} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            {t("have_account")}{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              {t("login_link")}
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
