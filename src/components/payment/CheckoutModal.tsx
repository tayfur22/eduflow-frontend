"use client";

import { useEffect, useState } from "react";
import {
  loadStripe, StripeElementsOptions,
} from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "@/lib/api";
import {
  X, CreditCard, Lock, CheckCircle, Loader2, ShieldCheck,
} from "lucide-react";

// Stripe public key — .env.local-da NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY əlavə edin
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_YOUR_KEY"
);

// ── Tip ────────────────────────────────────────────────────
interface CheckoutModalProps {
  courseId: number;
  courseTitle: string;
  price: number;
  currency?: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Xarici modal (clientSecret alır, Elements qurur) ───────
export default function CheckoutModal({
  courseId, courseTitle, price, currency = "AZN", onClose, onSuccess,
}: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post(`/api/payments/create-intent?courseId=${courseId}`)
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(err => {
        setInitError(err.response?.data?.error || "Ödəniş başlada bilmədi");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const elementsOptions: StripeElementsOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#e8541a",
        colorBackground: "#ffffff",
        colorText: "#1a1814",
        colorDanger: "#ef4444",
        fontFamily: "DM Sans, system-ui, sans-serif",
        borderRadius: "10px",
        spacingUnit: "4px",
      },
    },
  } : {};

  return (
    /* Backdrop */
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div className="card animate-fade-up" style={{
        width: "100%", maxWidth: 480, padding: "32px 32px 28px",
        maxHeight: "90vh", overflowY: "auto", position: "relative",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 4, borderRadius: 6,
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={20} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, margin: 0 }}>Kursa qeydiyyat</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{courseTitle}</p>
          </div>
        </div>

        {/* Price */}
        <div style={{
          background: "var(--bg-secondary)", borderRadius: 12, padding: "14px 18px",
          marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Məbləğ</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "Syne, sans-serif" }}>
            {price.toFixed(2)} {currency}
          </span>
        </div>

        {/* Loading / error / Stripe form */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "var(--accent)", margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Ödəniş hazırlanır...</p>
          </div>
        ) : initError ? (
          <div style={{ padding: "16px", background: "#fef2f2", borderRadius: 10, color: "#dc2626", fontSize: 14, textAlign: "center" }}>
            {initError}
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        ) : null}

        {/* Security note */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          marginTop: 20, justifyContent: "center",
        }}>
          <ShieldCheck size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            256-bit SSL şifrələmə · Stripe tərəfindən qorunur
          </span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Daxili form (Stripe hooks) ─────────────────────────────
function CheckoutForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Xəta baş verdi");
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Ödəniş tamamlanmadı");
      setLoading(false);
    } else {
      setPaid(true);
      setTimeout(() => onSuccess(), 2000);
    }
  };

  if (paid) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle size={30} color="#16a34a" />
        </div>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Ödəniş qəbul edildi!</h3>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Kursa yönləndirilirsiniz...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <div style={{ padding: "11px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 9, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !stripe}
        className="btn btn-primary"
        style={{ justifyContent: "center", fontSize: 15, padding: "13px" }}
      >
        {loading
          ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Ödənilir...</>
          : <><Lock size={15} /> Təhlükəsiz ödə</>}
      </button>

      <button
        onClick={onClose}
        className="btn btn-ghost"
        style={{ justifyContent: "center", fontSize: 14 }}
      >
        Ləğv et
      </button>
    </div>
  );
}
