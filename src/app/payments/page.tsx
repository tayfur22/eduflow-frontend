"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { CreditCard, BookOpen, ArrowLeft, CheckCircle, Clock, XCircle, Receipt } from "lucide-react";

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/payments/my")
      .then(r => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalSpent = payments
    .filter(p => p.status === "COMPLETED" || p.status === "SUCCESS")
    .reduce((a, p) => a + (p.amount || 0), 0);

  const statusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return <CheckCircle size={15} color="#16a34a" />;
      case "PENDING":
        return <Clock size={15} color="#d97706" />;
      default:
        return <XCircle size={15} color="#dc2626" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS": return "Tamamlandı";
      case "PENDING": return "Gözlənilir";
      case "FAILED":  return "Uğursuz";
      case "REFUNDED": return "Geri qaytarıldı";
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS": return { bg: "#f0fdf4", color: "#15803d" };
      case "PENDING": return { bg: "#fffbeb", color: "#92400e" };
      default:        return { bg: "#fef2f2", color: "#b91c1c" };
    }
  };

  if (!user) return null;

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "36px 0" }}>
        <div className="container">
          <Link href="/dashboard/student" className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 12px", marginBottom: 20, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Dashboarda qayıt
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, display: "flex", alignItems: "center", gap: 10 }}>
                <Receipt size={26} color="var(--accent)" /> Ödəniş tarixi
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
                Bütün ödənişlərinizin siyahısı
              </p>
            </div>
            {totalSpent > 0 && (
              <div className="card" style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 12 }}>
                <CreditCard size={20} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Ümumi xərc</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
                    {totalSpent.toFixed(2)} AZN
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 80 }} />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="card" style={{ padding: "64px", textAlign: "center" }}>
              <CreditCard size={44} style={{ margin: "0 auto 16px", opacity: 0.25, color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 16 }}>
                Hələ heç bir ödənişiniz yoxdur
              </p>
              <Link href="/courses" className="btn btn-primary" style={{ fontSize: 13 }}>
                Kurslara bax
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payments.map((p: any) => {
                const sc = statusColor(p.status);
                return (
                  <div key={p.id} className="card" style={{ padding: "18px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: "var(--accent-soft)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <BookOpen size={18} color="var(--accent)" />
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                            {p.courseTitle || `Kurs #${p.courseId}`}
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleString("az-AZ", {
                              day: "2-digit", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            }) : "—"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 100,
                          background: sc.bg, color: sc.color,
                          display: "flex", alignItems: "center", gap: 5,
                        }}>
                          {statusIcon(p.status)} {statusLabel(p.status)}
                        </span>
                        <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif", minWidth: 80, textAlign: "right" }}>
                          {p.amount ? `${p.amount} AZN` : "—"}
                        </p>
                      </div>
                    </div>

                    {p.transactionId && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                        Tranzaksiya: <span style={{ fontFamily: "monospace" }}>{p.transactionId}</span>
                      </p>
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
