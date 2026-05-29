"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Award, Download, CheckCircle, Search, ExternalLink, Share2, QrCode, Printer, X } from "lucide-react";
import { CertificateSkeleton, EmptyCertificates } from "@/components/ui/Skeletons";

type Certificate = {
  id: number;
  courseTitle: string;
  issuedAt: string;
  certificateNumber: string;
  teacherName?: string;
  studentName?: string;
};

// QR Code using Google Charts API (no package needed)
function QRCodeImage({ value, size = 120 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=1a1814&margin=4`;
  return (
    <img src={url} alt="QR Code" width={size} height={size}
      style={{ borderRadius: 8, border: "1px solid var(--border)" }} />
  );
}

// Certificate modal — full preview
function CertificateModal({ cert, onClose, studentName }: { cert: Certificate; onClose: () => void; studentName: string }) {
  const certRef = useRef<HTMLDivElement>(null);
  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/certificates/verify/${cert.certificateNumber}` : "";

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win || !certRef.current) return;
    win.document.write(`
      <html><head><title>Sertifikat — ${cert.courseTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        body { margin: 0; padding: 0; background: white; }
        .cert { width: 900px; min-height: 640px; margin: 0 auto; position: relative; }
      </style>
      </head><body>${certRef.current.outerHTML}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleLinkedIn = () => {
    const certDate = new Date(cert.issuedAt);
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: cert.courseTitle,
      organizationName: "EduPlatform",
      issueYear: String(certDate.getFullYear()),
      issueMonth: String(certDate.getMonth() + 1),
      certId: cert.certificateNumber,
      certUrl: verifyUrl,
    });
    window.open(`https://www.linkedin.com/profile/add?${params}`, "_blank");
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, overflowY: "auto",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-xl)",
        width: "100%", maxWidth: 680,
        overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 15 }}>Sertifikat</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Certificate design */}
        <div style={{ padding: 24 }}>
          <div ref={certRef} style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
            borderRadius: 16, padding: "48px 52px", position: "relative", overflow: "hidden",
            color: "white", fontFamily: "DM Sans, sans-serif",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} color="white" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, letterSpacing: "0.1em", textTransform: "uppercase" }}>EduPlatform</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Sertifikat №</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, opacity: 0.9, letterSpacing: "0.05em" }}>{cert.certificateNumber}</div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6, marginBottom: 10 }}>Bu sertifikat təqdim edilir</p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.1 }}>
                {studentName}
              </h2>
              <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>aşağıdakı kursu uğurla tamamladığına görə:</p>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 700, color: "#c4b5fd" }}>
                {cert.courseTitle}
              </h3>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ width: 140, height: 1, background: "rgba(255,255,255,0.3)", marginBottom: 8 }} />
                <p style={{ fontSize: 11, opacity: 0.6 }}>Tarix: {new Date(cert.issuedAt).toLocaleDateString("az-AZ", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {/* QR code */}
              <div style={{ background: "white", borderRadius: 10, padding: 6 }}>
                <QRCodeImage value={verifyUrl} size={72} />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "0 24px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", minWidth: 130 }}>
            <Printer size={15} /> Çap et / PDF
          </button>
          <button onClick={handleLinkedIn} className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", minWidth: 130, gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(verifyUrl); }}
            className="btn btn-secondary"
            style={{ justifyContent: "center", padding: "10px 14px" }}
            title="Linki kopyala"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* QR verify section */}
        <div style={{ margin: "0 24px 24px", padding: 16, borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <QrCode size={16} color="var(--accent)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Yoxlama linki</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", wordBreak: "break-all" }}>{verifyUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/certificates/my")
      .then(r => setCertificates(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const verify = async () => {
    if (!verifyCode.trim()) return;
    setVerifying(true); setVerifyResult(null); setVerifyError("");
    try {
      const r = await api.get(`/api/certificates/verify/${verifyCode.trim()}`);
      setVerifyResult(r.data);
    } catch {
      setVerifyError("Sertifikat tapılmadı");
    } finally {
      setVerifying(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Certificate modal */}
      {selectedCert && (
        <CertificateModal
          cert={selectedCert}
          studentName={user.fullName}
          onClose={() => setSelectedCert(null)}
        />
      )}

      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "48px 0" }}>
        <div className="container">
          <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
            }}>
              <Award size={26} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)" }}>Sertifikatlarım</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {certificates.length} sertifikat qazanılıb
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr min(360px, 100%)", gap: 32, alignItems: "start" }} className="mobile-stack">

            {/* Certificates */}
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 20 }}>Qazanılan sertifikatlar</h2>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2].map(i => <CertificateSkeleton key={i} />)}
                </div>
              ) : certificates.length === 0 ? (
                <EmptyCertificates />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {certificates.map((cert, i) => (
                    <div
                      key={cert.id}
                      className="card animate-fade-up"
                      style={{
                        padding: "22px 24px",
                        animationDelay: `${i * 0.08}s`, opacity: 0,
                        background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(124,58,237,0.04) 100%)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setSelectedCert(cert)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
                        }}>
                          <Award size={22} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: 16, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cert.courseTitle}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle size={12} color="var(--success)" />
                              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                {new Date(cert.issuedAt).toLocaleDateString("az-AZ", { year: "numeric", month: "long", day: "numeric" })}
                              </span>
                            </div>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "2px 8px", borderRadius: 100,
                              background: "#ede9fe", color: "#7c3aed",
                              fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                            }}>
                              {cert.certificateNumber}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: 12, padding: "7px 12px", gap: 5 }}
                            onClick={e => { e.stopPropagation(); setSelectedCert(cert); }}
                          >
                            <Download size={13} /> Yüklə
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verify card */}
            <div style={{ position: "sticky", top: 90 }}>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Search size={17} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Sertifikat Yoxla</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Nömrə ilə doğrula</p>
                  </div>
                </div>

                <input
                  className="input"
                  placeholder="EDU-XXXXXXXX"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && verify()}
                  style={{ marginBottom: 10, fontFamily: "monospace", letterSpacing: "0.05em" }}
                />
                <button
                  onClick={verify}
                  disabled={verifying || !verifyCode.trim()}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {verifying ? "Yoxlanır..." : <><ExternalLink size={14} /> Yoxla</>}
                </button>

                {verifyResult && (
                  <div className="animate-fade-in" style={{
                    marginTop: 16, padding: 16, borderRadius: 10,
                    background: "#dcfce7", border: "1px solid #86efac",
                  }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                      <CheckCircle size={16} color="#16a34a" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Sertifikat doğrudur ✓</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#166534", marginBottom: 4 }}><b>Şagird:</b> {verifyResult.studentName}</p>
                    <p style={{ fontSize: 13, color: "#166534", marginBottom: 4 }}><b>Kurs:</b> {verifyResult.courseTitle}</p>
                    <p style={{ fontSize: 13, color: "#166534" }}>
                      <b>Tarix:</b> {new Date(verifyResult.issuedAt).toLocaleDateString("az-AZ")}
                    </p>
                    {/* QR for verified cert */}
                    <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                      <QRCodeImage value={`${typeof window !== "undefined" ? window.location.origin : ""}/certificates/verify/${verifyCode}`} size={90} />
                    </div>
                  </div>
                )}

                {verifyError && (
                  <div className="animate-fade-in" style={{
                    marginTop: 16, padding: 14, borderRadius: 10,
                    background: "#fef2f2", border: "1px solid #fca5a5",
                    fontSize: 13, color: "#dc2626", textAlign: "center",
                  }}>
                    {verifyError}
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="card" style={{ padding: 20, marginTop: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <QrCode size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>QR Kod ilə yoxlama</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      Hər sertifikatda unikal QR kod var. Onu scan edərək sertifikatın həqiqiliyini dərhal yoxlaya bilərsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
