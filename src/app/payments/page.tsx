"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  CreditCard, BookOpen, ArrowLeft, CheckCircle,
  Clock, XCircle, Receipt, RefreshCw, ExternalLink,
  TrendingUp, ShieldCheck,
} from "lucide-react";

interface Payment {
  id: number;
  courseId: number;
  courseTitle: string;
  amount: number;
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  stripePaymentIntentId?: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "FAILED">("ALL");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/payments/my")
      .then(r => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const completed = payments.filter(p => p.status === "COMPLETED");
  const totalSpent = completed.reduce((a, p) => a + (p.amount || 0), 0);
  const filtered = filter === "ALL" ? payments : payments.filter(p => p.status === filter);

  const statusConfig = {
    COMPLETED: { icon: <CheckCircle size={13} />, label: "Tamamlandı", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    PENDING:   { icon: <Clock size={13} />,        label: "Gözlənilir", bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
    FAILED:    { icon: <XCircle size={13} />,       label: "Uğursuz",    bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    REFUNDED:  { icon: <RefreshCw size={13} />,     label: "Geri qaytarıldı", bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("az-AZ", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="page" style={{ paddingTop: 80 }}>

      {/* Page header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "36px 0" }}>
        <div className="container">
          <Link href="/dashboard/student" className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 12px", marginBottom: 20, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Dashboarda qayıt
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 28, display: "flex", alignItems: "center", gap: 10 }}>
                <Receipt size={26} color="var(--accent)" /> Ödəniş tarixi
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
                Bütün ödənişlərinizin siyahısı
              </p>
            </div>

            {/* Stats row */}
            {payments.length > 0 && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                  <CreditCard size={18} color="var(--accent)" />
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Ümumi xərc</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
                      {totalSpent.toFixed(2)} AZN
                    </p>
                  </div>
                </div>
                <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                  <TrendingUp size={18} color="#16a34a" />
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Uğurlu ödəniş</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#16a34a", fontFamily: "Syne, sans-serif" }}>
                      {completed.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          {payments.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
              {(["ALL", "COMPLETED", "PENDING", "FAILED"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: "1px solid",
                    borderColor: filter === f ? "var(--accent)" : "var(--border)",
                    background: filter === f ? "var(--accent)" : "var(--bg-card)",
                    color: filter === f ? "white" : "var(--text-secondary)",
                    fontWeight: filter === f ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {f === "ALL" ? `Hamısı (${payments.length})`
                   : f === "COMPLETED" ? `Tamamlandı (${payments.filter(p => p.status === "COMPLETED").length})`
                   : f === "PENDING" ? `Gözlənilir (${payments.filter(p => p.status === "PENDING").length})`
                   : `Uğursuz (${payments.filter(p => p.status === "FAILED").length})`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment list */}
      <div className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card skeleton" style={{ height: 88 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: "64px", textAlign: "center" }}>
              <CreditCard size={44} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--text-muted)", display: "block" }} />
              <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 16 }}>
                {filter === "ALL" ? "Hələ heç bir ödənişiniz yoxdur" : "Bu kateqoriyada ödəniş yoxdur"}
              </p>
              <Link href="/courses" className="btn btn-primary" style={{ fontSize: 13, textDecoration: "none" }}>
                Kurslara bax
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(p => {
                const cfg = statusConfig[p.status] || statusConfig.FAILED;
                return (
                  <div key={p.id} className="card" style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      {/* Left: icon + info */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen size={19} color="var(--accent)" />
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                            {p.courseTitle || `Kurs #${p.courseId}`}
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {p.createdAt ? formatDate(p.createdAt) : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Right: status + amount */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 100,
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          display: "flex", alignItems: "center", gap: 5,
                        }}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif", minWidth: 90, textAlign: "right" }}>
                          {p.amount ? `${p.amount.toFixed(2)} ${p.currency}` : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Tranzaksiya ID + kurs linki */}
                    {(p.stripePaymentIntentId || p.status === "COMPLETED") && (
                      <div style={{
                        marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                      }}>
                        {p.stripePaymentIntentId && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                            <ShieldCheck size={11} />
                            Tranzaksiya: <code style={{ fontFamily: "monospace", fontSize: 11 }}>{p.stripePaymentIntentId.slice(0, 24)}...</code>
                          </span>
                        )}
                        {p.status === "COMPLETED" && (
                          <Link
                            href={`/courses/${p.courseId}`}
                            style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <ExternalLink size={11} /> Kursa keç
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
