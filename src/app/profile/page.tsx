"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  User, Mail, Lock, Camera, Save, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader, GraduationCap, BookOpen,
} from "lucide-react";

type Tab = "profile" | "password";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile form
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Avatar upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // Password form
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Load current profile
  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/api/users/profile").then((res) => {
      setFullName(res.data.fullName || "");
      setBio(res.data.bio || "");
      setProfileImage(res.data.profileImage || "");
    }).catch(() => {
      setFullName(user.fullName || "");
      setProfileImage(user.profileImage || "");
    });
  }, [user]);

  // Avatar seç və Cloudinary-yə yüklə
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileMsg({ type: "err", text: "Yalnız şəkil faylı seçin" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: "err", text: "Şəkil 5MB-dan kiçik olmalıdır" });
      return;
    }
    setAvatarUploading(true);
    setUploadPct(0);
    try {
      const result = await uploadToCloudinary(file, setUploadPct);
      setProfileImage(result.url);
      setProfileMsg({ type: "ok", text: "Şəkil yükləndi. Saxla düyməsinə basın." });
    } catch {
      setProfileMsg({ type: "err", text: "Şəkil yüklənmədi. Cloudinary konfiqurasiyasını yoxlayın." });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileMsg({ type: "err", text: "Ad ən az 2 simvol olmalıdır" });
      return;
    }
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await api.put("/api/users/profile", {
        fullName: fullName.trim(),
        bio: bio.trim(),
        profileImage,
      });
      updateUser({
        fullName: res.data.fullName,
        profileImage: res.data.profileImage,
        bio: res.data.bio,
      });
      setProfileMsg({ type: "ok", text: "Profil uğurla yeniləndi!" });
    } catch (err: any) {
      setProfileMsg({ type: "err", text: err.response?.data?.error || "Xəta baş verdi" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: "err", text: "Bütün sahələri doldurun" });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "err", text: "Yeni şifrə ən az 6 simvol olmalıdır" });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "err", text: "Yeni şifrələr eyni deyil" });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      await api.put("/api/users/change-password", {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      setPwdMsg({ type: "ok", text: "Şifrə uğurla dəyişdirildi!" });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) {
      setPwdMsg({ type: "err", text: err.response?.data?.error || "Cari şifrə yanlışdır" });
    } finally {
      setPwdLoading(false);
    }
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  if (!user) return null;

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "var(--bg-secondary)",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Profil Ayarları</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Şəxsi məlumatlarınızı və hesab ayarlarınızı idarə edin
          </p>
        </div>

        {/* Avatar + name card */}
        <div className="card animate-fade-up" style={{ padding: "28px 28px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 84, height: 84, borderRadius: "50%",
                background: profileImage ? `url(${profileImage}) center/cover` : "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: "white",
                flexShrink: 0, border: "3px solid var(--border)",
                overflow: "hidden",
              }}>
                {!profileImage && initials}
              </div>

              {/* Upload overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--accent)", border: "2px solid var(--bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "white",
                }}
                title="Şəkil dəyiş"
              >
                {avatarUploading
                  ? <Loader size={13} style={{ animation: "spin 0.7s linear infinite" }} />
                  : <Camera size={13} />}
              </button>
              <input
                ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleAvatarChange}
              />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{fullName}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>{user.email}</p>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                padding: "3px 10px", borderRadius: 20,
                background: user.role === "TEACHER" ? "var(--accent-soft)" : "#dcfce7",
                color: user.role === "TEACHER" ? "var(--accent)" : "#15803d",
              }}>
                {user.role === "TEACHER"
                  ? <><GraduationCap size={11} /> MÜƏLLİM</>
                  : <><BookOpen size={11} /> TƏLƏBƏi</>}
              </span>
            </div>

            {avatarUploading && (
              <div style={{ width: "100%", marginTop: 8 }}>
                <div style={{
                  height: 4, borderRadius: 2, background: "var(--border)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: "var(--accent)",
                    width: `${uploadPct}%`,
                    transition: "width 0.2s",
                  }} />
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Yüklənir... {uploadPct}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-card)", borderRadius: 10, padding: 4, border: "1px solid var(--border)" }}>
          {(["profile", "password"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "9px 16px", borderRadius: 8,
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                border: "none",
                background: activeTab === tab ? "var(--accent)" : "transparent",
                color: activeTab === tab ? "white" : "var(--text-secondary)",
                transition: "all 0.18s",
              }}
            >
              {tab === "profile" ? "Profil məlumatları" : "Şifrə dəyiş"}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="card animate-fade-up" style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Ad soyad */}
              <div>
                <label style={labelStyle}>
                  <User size={13} /> Ad Soyad
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="input"
                  maxLength={100}
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <label style={labelStyle}>
                  <Mail size={13} /> Email (dəyişdirilmir)
                </label>
                <input
                  value={user.email}
                  disabled
                  className="input"
                  style={{ opacity: 0.55, cursor: "not-allowed" }}
                />
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>
                  Haqqımda
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    {" "}({bio.length}/500)
                  </span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Özünüz haqqında qısa məlumat..."
                  maxLength={500}
                  rows={4}
                  className="input"
                  style={{ resize: "vertical", minHeight: 100, lineHeight: 1.6 }}
                />
              </div>

              {/* Message */}
              {profileMsg && (
                <div style={msgStyle(profileMsg.type)}>
                  {profileMsg.type === "ok"
                    ? <CheckCircle size={15} />
                    : <AlertCircle size={15} />}
                  {profileMsg.text}
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleProfileSave}
                disabled={profileLoading}
                className="btn btn-primary"
                style={{ alignSelf: "flex-start", gap: 8 }}
              >
                {profileLoading
                  ? <><Loader size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Saxlanılır...</>
                  : <><Save size={15} /> Dəyişiklikləri saxla</>}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="card animate-fade-up" style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <PasswordField
                label="Cari şifrə"
                value={currentPwd}
                onChange={setCurrentPwd}
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
                placeholder="Mövcud şifrəniz"
              />

              <PasswordField
                label="Yeni şifrə"
                value={newPwd}
                onChange={setNewPwd}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Ən az 6 simvol"
              />

              {/* Strength indicator */}
              {newPwd.length > 0 && (
                <PasswordStrength password={newPwd} />
              )}

              <PasswordField
                label="Yeni şifrəni təsdiqlə"
                value={confirmPwd}
                onChange={setConfirmPwd}
                show={showNew}
                onToggle={() => {}}
                placeholder="Şifrəni təkrar daxil edin"
                error={confirmPwd.length > 0 && confirmPwd !== newPwd ? "Şifrələr uyğun gəlmir" : undefined}
              />

              {pwdMsg && (
                <div style={msgStyle(pwdMsg.type)}>
                  {pwdMsg.type === "ok"
                    ? <CheckCircle size={15} />
                    : <AlertCircle size={15} />}
                  {pwdMsg.text}
                </div>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={pwdLoading}
                className="btn btn-primary"
                style={{ alignSelf: "flex-start", gap: 8 }}
              >
                {pwdLoading
                  ? <><Loader size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Dəyişdirilir...</>
                  : <><Lock size={15} /> Şifrəni dəyiş</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function PasswordField({ label, value, onChange, show, onToggle, placeholder, error }: {
  label: string; value: string;
  onChange: (v: string) => void;
  show: boolean; onToggle: () => void;
  placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label style={labelStyle}><Lock size={13} /> {label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input"
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 0,
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["Zəif", "Orta", "Yaxşı", "Güclü"];
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#16a34a"];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= score ? colors[score - 1] : "var(--border)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: colors[score - 1] || "var(--text-muted)" }}>
        Şifrə gücü: {labels[score - 1] || "Çox zəif"}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 7,
};

const msgStyle = (type: "ok" | "err"): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 8,
  padding: "11px 14px", borderRadius: 8, fontSize: 13,
  background: type === "ok" ? "#dcfce7" : "#fef2f2",
  color: type === "ok" ? "#15803d" : "#dc2626",
  border: `1px solid ${type === "ok" ? "#bbf7d0" : "#fecaca"}`,
});
