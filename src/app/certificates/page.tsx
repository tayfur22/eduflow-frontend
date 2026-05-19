"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Award, Download, CheckCircle, Search, ExternalLink } from "lucide-react";

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/certificates/my")
      .then(r => setCertificates(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const verify = async () => {
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    setVerifyError("");
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
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "48px 0" }}>
        <div className="container">
          <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Award size={24} color="white" />
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>Sertifikatlarım</h1>
          </div>
          <p className="animate-fade-up delay-1" style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Tamamladığınız kursların sertifikatları
          </p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>

            {/* Certificates */}
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>Qazanılan sertifikatlar</h2>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2].map(i => <div key={i} className="card skeleton" style={{ height: 120 }} />)}
                </div>
              ) : certificates.length === 0 ? (
                <div className="card" style={{ padding: "56px 40px", textAlign: "center" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <Award size={28} color="#7c3aed" style={{ opacity: 0.5 }} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Hələ sertifikat yoxdur</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    Kursu 100% tamamladıqdan sonra sertifikat əldə edə bilərsiniz
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {certificates.map((cert, i) => (
                    <div key={cert.id} className="card animate-fade-up" style={{
                      padding: "24px 28px",
                      animationDelay: `${i * 0.08}s`, opacity: 0,
                      background: "linear-gradient(135deg, var(--bg-card), var(--bg-secondary))",
                      border: "1px solid var(--border)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Award size={24} color="white" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 17, marginBottom: 4 }}>{cert.courseTitle}</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <CheckCircle size={13} color="var(--success)" />
                              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                {new Date(cert.issuedAt).toLocaleDateString("az-AZ", { year: "numeric", month: "long", day: "numeric" })}
                              </span>
                            </div>
                            <div style={{
                              marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "3px 10px", borderRadius: 100,
                              background: "#ede9fe", color: "#7c3aed",
                              fontSize: 12, fontWeight: 600, fontFamily: "monospace",
                            }}>
                              {cert.certificateNumber}
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }}>
                          <Download size={13} /> Yüklə
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verify */}
            <div style={{ position: "sticky", top: 90 }}>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Search size={17} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15 }}>Sertifikat Yoxla</h3>
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
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <CheckCircle size={16} color="#16a34a" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>Sertifikat doğrudur</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#166534" }}><b>Şagird:</b> {verifyResult.studentName}</p>
                    <p style={{ fontSize: 13, color: "#166534" }}><b>Kurs:</b> {verifyResult.courseTitle}</p>
                    <p style={{ fontSize: 13, color: "#166534" }}>
                      <b>Tarix:</b> {new Date(verifyResult.issuedAt).toLocaleDateString("az-AZ")}
                    </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
