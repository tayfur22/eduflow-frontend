"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Course } from "@/types";
import { useLangStore } from "@/store/langStore";
import {
  ArrowRight, BookOpen, Users, Award, Zap, Star, ChevronRight,
  Play, CheckCircle, Shield, Clock, Globe, TrendingUp,
  MessageSquare, Sparkles, Code, Palette, BarChart2, Brain,
  ChevronDown, ChevronUp, GraduationCap, Cpu, Music
} from "lucide-react";

function CourseCard({ course, delay }: { course: Course; delay: number }) {
  const { t } = useLangStore();
  const accessBadge = {
    FREE:          { label: t("filter_free"),      className: "badge-free" },
    PAID:          { label: `${course.price} AZN`, className: "badge-paid" },
    CODE_REQUIRED: { label: t("filter_code"),      className: "badge-code" },
  }[course.accessType];

  return (
    <Link href={`/courses/${course.id}`}
      className={`card card-interactive animate-fade-up delay-${delay}`}
      style={{ textDecoration: "none", display: "block", overflow: "hidden" }}>
      <div style={{
        height: 188,
        background: course.thumbnailUrl
          ? `url(${course.thumbnailUrl}) center/cover`
          : "linear-gradient(135deg, var(--accent-soft) 0%, rgba(26,110,232,0.06) 100%)",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!course.thumbnailUrl && <BookOpen size={42} color="var(--accent)" style={{ opacity: 0.35 }} />}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span className={`badge ${accessBadge.className}`}>{accessBadge.label}</span>
        </div>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 60%)",
        }} />
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {course.teacherName}
        </p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.35 }}>
          {course.title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {course.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={11} color="#f59e0b" fill="#f59e0b" />)}
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>(4.9)</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <BookOpen size={12} /> {course.sections?.length || 0} {t("sections")}
          </span>
        </div>
      </div>
    </Link>
  );
}

const FEATURES = [
  { icon: Sparkles, title: "AI Tutor Dəstəyi", desc: "Hər dərsdə AI tutor ilə suallarını dərhal cavabla. 24/7 köməklik, şəxsi izah." },
  { icon: Shield,   title: "Sertifikat Sistemi", desc: "Kursu bitirdikdən sonra doğrulanmış sertifikat al. QR kod ilə yoxlanıla bilən." },
  { icon: Zap,      title: "AI Quiz Generator", desc: "Müəllimlər üçün — mövzu daxil et, AI avtomatik quiz sualları yaratsın." },
  { icon: Globe,    title: "3 Dil Dəstəyi", desc: "Azərbaycan, Rus, İngilis dillərində tam dəstək. İstənilən dildə öyrən." },
  { icon: TrendingUp, title: "Tərəqqi İzləmə", desc: "Hər dərs, quiz və kursda tərəqqini izlə. Dashboard ilə vəziyyəti görün." },
  { icon: Clock,    title: "Öz Sürətin", desc: "Heç bir deadline yoxdur. İstənilən vaxt, istənilən yerdən davam et." },
];

const CATEGORIES = [
  { icon: Code,       label: "Proqramlaşdırma", count: "48 kurs",  color: "#4f46e5" },
  { icon: BarChart2,  label: "Biznes & Maliyyə", count: "32 kurs", color: "#0ea5e9" },
  { icon: Palette,    label: "Dizayn & Kreativ",  count: "27 kurs", color: "#ec4899" },
  { icon: Brain,      label: "Süni İntellekt",    count: "21 kurs", color: "#8b5cf6" },
  { icon: GraduationCap, label: "Akademik",       count: "35 kurs", color: "#16a34a" },
  { icon: Cpu,        label: "Hardware & IoT",    count: "14 kurs", color: "#f59e0b" },
  { icon: MessageSquare, label: "Dillər",         count: "18 kurs", color: "#e8541a" },
  { icon: Music,      label: "Musiqi & Sənət",    count: "11 kurs", color: "#14b8a6" },
];

const REVIEWS = [
  { name: "Aysel Məmmədova",  role: "Full Stack Developer",    text: "AI tutor funksiyası həqiqətən fərq yaratdı. Hər sualıma dərhal cavab aldım. Bu platformasız React öyrənmək çox çətin olardı.",  stars: 5, initial: "A" },
  { name: "Kamran Hüseynov",  role: "UX/UI Designer",          text: "Kurs strukturu çox aydındır. Müəllim videoları keyfiyyətli, məzmun isə praktikəyə yönəlmiş. Sertifikatımı artıq portfelimə əlavə etdim.", stars: 5, initial: "K" },
  { name: "Nərmin Əliyeva",   role: "Data Analyst",            text: "Python kursunu 3 həftəyə bitirdim. Quiz sistemi bilikləri möhkəmləndirməyə çox kömək etdi. Yüksək tövsiyə edirəm!", stars: 5, initial: "N" },
  { name: "Tural Quliyev",    role: "Backend Developer",       text: "Java Spring Boot kursu şirkətimdəki işimə birbaşa təsir etdi. Müəllim real layihələrdən nümunələr gətirir.", stars: 5, initial: "T" },
  { name: "Günel Rəsulova",   role: "Product Manager",         text: "Biznes analitika kursunu işlə yanaşı rahatlıqla bitirdim. Heç bir deadline olmadığı üçün öz sürətimdə irəlilədim.", stars: 5, initial: "G" },
  { name: "Elçin Babayev",    role: "Mobile Developer",        text: "Flutter kursundakı AI tutor mövzuları əvvəlcədən izah etdi, dərsə daha hazır girdim. Innovativ yanaşma!", stars: 5, initial: "E" },
];

const FAQS = [
  { q: "EduFlow tamamilə pulsuzdur?", a: "Pulsuz kurslarımız var, lakin premium kurslar ödənişlidir. Həm pulsuz, həm də ödənişli kursları bir platformada tapa bilərsiniz." },
  { q: "Sertifikatlar tanınırmı?", a: "EduFlow sertifikatları QR kod ilə doğrulanmış rəqəmsal sertifikatlardır. CV-yə, LinkedIn-ə əlavə edilə bilər." },
  { q: "Müəllim kimi qoşula bilərəmmi?", a: "Bəli! Qeydiyyatda 'Müəllim' rolunu seçin. Kurs yaratma, AI quiz generator, şagird idarəetməsi kimi bütün alətlərə çıxışınız olacaq." },
  { q: "Kursları offline izləmək mümkündür?", a: "Hazırda kurslar yalnız onlayn mövcuddur. Offline rejim yaxın vaxtda əlavə ediləcək." },
  { q: "Ödəniş metodları hansılardır?", a: "Kart ilə ödəniş, bank köçürməsi və giriş kodu sistemi ilə ödəniş dəstəklənir." },
  { q: "AI Tutor necə işləyir?", a: "Hər dərsin içindən AI tutora sual verə bilərsiniz. AI dərs məzmununa əsasən dərindən izah edir." },
];

export default function HomePage() {
  const { t } = useLangStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    api.get("/api/courses/public")
      .then(r => setCourses(r.data.slice(0, 6)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { icon: Users,    value: "2,400+", label: t("stat_students") },
    { icon: BookOpen, value: "180+",   label: t("stat_courses") },
    { icon: Award,    value: "1,200+", label: t("stat_certificates") },
    { icon: Star,     value: "4.9",    label: t("stat_rating") },
  ];

  return (
    <div className="page">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        {/* Blobs */}
        <div style={{ position:"absolute", top:-120, right:-160, width:620, height:620, borderRadius:"50%", background:"radial-gradient(circle, var(--accent-soft) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-180, left:-80, width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle, rgba(26,110,232,0.07) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"30%", left:"45%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(232,84,26,0.04) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div className="container" style={{ position:"relative", zIndex:1, paddingTop:60, paddingBottom:80 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:60, alignItems:"center" }}>

            {/* LEFT */}
            <div>
              {/* Tag */}
              <div className="tag animate-fade-up" style={{ marginBottom:28 }}>
                <Zap size={13} /> {t("hero_tag")}
              </div>

              <h1 className="animate-fade-up delay-1" style={{ fontSize:"clamp(46px,6vw,74px)", fontWeight:800, lineHeight:1.04, marginBottom:24, color:"var(--text-primary)" }}>
                {t("hero_title_1")}{" "}
                <span className="gradient-text">{t("hero_title_2")}</span>{" "}
                {t("hero_title_3")}
              </h1>

              <p className="animate-fade-up delay-2" style={{ fontSize:"clamp(16px,2vw,18px)", color:"var(--text-secondary)", lineHeight:1.75, marginBottom:36, maxWidth:520 }}>
                {t("hero_desc")}
              </p>

              <div className="animate-fade-up delay-3" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:48 }}>
                <Link href="/courses" className="btn btn-primary" style={{ fontSize:15, padding:"13px 28px" }}>
                  {t("hero_btn_courses")} <ArrowRight size={17} />
                </Link>
                <Link href="/register" className="btn btn-secondary" style={{ fontSize:15, padding:"13px 28px" }}>
                  <Play size={15} /> {t("hero_btn_free")}
                </Link>
              </div>

              {/* Social proof */}
              <div className="animate-fade-up delay-4" style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ display:"flex" }}>
                  {["A","B","C","D"].map((l,i) => (
                    <div key={l} style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${i*60},60%,55%)`, border:"2px solid var(--bg-primary)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white", marginLeft: i > 0 ? -8 : 0 }}>
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:"flex", gap:2, marginBottom:2 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} color="#f59e0b" fill="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize:12, color:"var(--text-secondary)" }}>
                    <strong style={{ color:"var(--text-primary)" }}>2,400+</strong> aktiv şagird
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT — floating card */}
            <div className="animate-fade-up delay-3 animate-float hide-mobile" style={{ position:"relative" }}>
              <div className="glass" style={{ padding:28, borderRadius:24, boxShadow:"var(--shadow-xl)" }}>
                {/* mini course card */}
                <div style={{ background:"var(--accent-soft)", borderRadius:14, padding:20, marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Code size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>React.js Əsasları</p>
                      <p style={{ fontSize:11, color:"var(--text-muted)" }}>8 bölmə · 48 dərs</p>
                    </div>
                  </div>
                  <div style={{ height:6, background:"rgba(232,84,26,0.15)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:"72%", background:"var(--accent)", borderRadius:3 }} />
                  </div>
                  <p style={{ fontSize:11, color:"var(--accent)", fontWeight:600, marginTop:6 }}>72% tamamlandı</p>
                </div>

                {/* Stats row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { val:"24", label:"Tamamlanan dərs", color:"#16a34a" },
                    { val:"4.9", label:"Ümumi reytinq",   color:"#f59e0b" },
                    { val:"3",  label:"Sertifikat",        color:"#7c3aed" },
                    { val:"AI", label:"Tutor aktiv",       color:"var(--accent)" },
                  ].map(({val, label, color}) => (
                    <div key={label} style={{ background:"var(--bg-secondary)", borderRadius:10, padding:"12px 14px", border:"1px solid var(--border)" }}>
                      <p style={{ fontSize:20, fontWeight:800, fontFamily:"Syne, sans-serif", color, lineHeight:1 }}>{val}</p>
                      <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:3 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="glass pulse-ring" style={{ position:"absolute", top:-16, right:-16, padding:"8px 16px", borderRadius:100, display:"flex", alignItems:"center", gap:6 }}>
                <Sparkles size={14} color="var(--accent)" />
                <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>AI Tutor</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-5" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:24, marginTop:72, paddingTop:48, borderTop:"1px solid var(--border)" }}>
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="stat-card">
                <div style={{ width:44, height:44, background:"var(--accent-soft)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                  <Icon size={20} color="var(--accent)" />
                </div>
                <div style={{ fontSize:28, fontWeight:800, fontFamily:"Syne, sans-serif", color:"var(--text-primary)", letterSpacing:"-0.03em" }}>{value}</div>
                <div style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUSTED COMPANIES
      ══════════════════════════════════════ */}
      <section style={{ padding:"40px 0", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
        <div className="container">
          <p style={{ fontSize:13, color:"var(--text-muted)", textAlign:"center", marginBottom:28, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Şagirdlərimiz bu şirkətlərdə işləyir
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:"32px 48px" }}>
            {["Kapital Bank","ABB","Nar Mobile","Azercell","PASHA Bank","Silk Way","BP Azerbaijan","SOCAR"].map(company => (
              <span key={company} style={{ fontSize:15, fontWeight:700, color:"var(--text-muted)", letterSpacing:"-0.01em", opacity:0.6, fontFamily:"Syne, sans-serif" }}>
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          POPULAR COURSES
      ══════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:48, flexWrap:"wrap", gap:16 }}>
            <div>
              <div className="tag animate-fade-up" style={{ marginBottom:12 }}>
                <TrendingUp size={12} /> Populyar
              </div>
              <h2 className="animate-fade-up delay-1" style={{ fontSize:"clamp(28px,4vw,42px)", marginBottom:8 }}>{t("popular_courses")}</h2>
              <p className="animate-fade-up delay-2" style={{ color:"var(--text-secondary)", fontSize:15 }}>{t("popular_desc")}</p>
            </div>
            <Link href="/courses" className="btn btn-secondary animate-fade-up" style={{ fontSize:13 }}>
              {t("see_all")} <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
              {[1,2,3].map(i => (
                <div key={i} className="card" style={{ height:340 }}>
                  <div className="skeleton" style={{ height:188 }} />
                  <div style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
                    <div className="skeleton" style={{ height:12, width:"50%" }} />
                    <div className="skeleton" style={{ height:18 }} />
                    <div className="skeleton" style={{ height:12, width:"80%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
              <BookOpen size={40} style={{ margin:"0 auto 16px", opacity:0.3 }} />
              <p>{t("no_courses")}</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
              {courses.map((c, i) => <CourseCard key={c.id} course={c} delay={Math.min(i+1,5)} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div className="tag animate-fade-up" style={{ marginBottom:12, display:"inline-flex" }}>
              <Globe size={12} /> Kateqoriyalar
            </div>
            <h2 className="animate-fade-up delay-1" style={{ fontSize:"clamp(28px,4vw,40px)", marginBottom:10 }}>
              İstənilən sahəni öyrən
            </h2>
            <p className="animate-fade-up delay-2" style={{ color:"var(--text-secondary)", fontSize:15 }}>
              8 əsas kateqoriyada yüzlərlə kurs sizi gözləyir
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
            {CATEGORIES.map(({ icon: Icon, label, count, color }, i) => (
              <Link key={label} href="/courses"
                className={`card animate-fade-up delay-${Math.min(i+1,5)}`}
                style={{ padding:"22px 18px", textDecoration:"none", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:3 }}>{label}</p>
                  <p style={{ fontSize:12, color:"var(--text-muted)" }}>{count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div className="tag animate-fade-up" style={{ marginBottom:12, display:"inline-flex" }}>
              <Sparkles size={12} /> Xüsusiyyətlər
            </div>
            <h2 className="animate-fade-up delay-1" style={{ fontSize:"clamp(28px,4vw,42px)", marginBottom:10 }}>
              Niyə EduFlow?
            </h2>
            <p className="animate-fade-up delay-2" style={{ color:"var(--text-secondary)", fontSize:16, maxWidth:520, margin:"0 auto" }}>
              Sadəcə video izləmək deyil — həqiqətən öyrənmək üçün hazırlanmış platform
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`feature-card animate-fade-up delay-${Math.min(i+1,5)}`}>
                <div style={{ width:48, height:48, borderRadius:14, background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                  <Icon size={22} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10, color:"var(--text-primary)" }}>{title}</h3>
                <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div className="tag animate-fade-up" style={{ marginBottom:12, display:"inline-flex" }}>
              <Star size={12} /> Rəylər
            </div>
            <h2 className="animate-fade-up delay-1" style={{ fontSize:"clamp(28px,4vw,40px)", marginBottom:10 }}>
              Şagirdlərimiz nə deyir?
            </h2>
            <p className="animate-fade-up delay-2" style={{ color:"var(--text-secondary)", fontSize:15 }}>
              2,400+ şagirdin əksəriyyəti bizi tövsiyə edir
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {REVIEWS.map(({ name, role, text, stars, initial }, i) => (
              <div key={name} className={`review-card animate-fade-up delay-${Math.min(i+1,5)}`}>
                <div style={{ display:"flex", gap:2, marginBottom:14 }}>
                  {Array(stars).fill(0).map((_,s) => <Star key={s} size={13} color="#f59e0b" fill="#f59e0b" />)}
                </div>
                <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:18 }}>"{text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"white", flexShrink:0 }}>
                    {initial}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{name}</p>
                    <p style={{ fontSize:11, color:"var(--text-muted)" }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div className="tag animate-fade-up" style={{ marginBottom:12, display:"inline-flex" }}>
              <Zap size={12} /> Qiymət
            </div>
            <h2 className="animate-fade-up delay-1" style={{ fontSize:"clamp(28px,4vw,40px)", marginBottom:10 }}>
              Sadə qiymət planları
            </h2>
            <p className="animate-fade-up delay-2" style={{ color:"var(--text-secondary)", fontSize:15 }}>
              Pulsuz başla, lazım olduqda yüksəlt
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, maxWidth:900, margin:"0 auto" }}>
            {/* Free */}
            <div className="card animate-fade-up" style={{ padding:32 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--text-muted)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Pulsuz</p>
              <div style={{ fontSize:40, fontWeight:800, fontFamily:"Syne, sans-serif", color:"var(--text-primary)", marginBottom:4 }}>₼0</div>
              <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>Ömürlük pulsuz</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {["Pulsuz kurslara tam çıxış","AI Tutor dəstəyi","Tərəqqi izləmə","Quiz sistemi"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--text-secondary)" }}>
                    <CheckCircle size={15} color="#16a34a" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn btn-outline" style={{ width:"100%", justifyContent:"center" }}>
                Pulsuz başla
              </Link>
            </div>

            {/* Pro — featured */}
            <div className="card animate-fade-up delay-1" style={{ padding:32, borderColor:"var(--accent)", borderWidth:2, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:16 }}>
                <span className="badge badge-accent">Ən populyar</span>
              </div>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--accent),#f0a060)" }} />
              <p style={{ fontSize:13, fontWeight:700, color:"var(--accent)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Premium</p>
              <div style={{ fontSize:40, fontWeight:800, fontFamily:"Syne, sans-serif", color:"var(--text-primary)", marginBottom:4 }}>₼29 <span style={{ fontSize:16, color:"var(--text-muted)", fontWeight:400 }}>/ay</span></div>
              <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>Bütün kurslar daxil</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {["Bütün premium kurslara çıxış","Sertifikat sistemi","Prioritet dəstək","Yeni kurslar dərhal","Offline rejim (tezliklə)","Kurs endirmə (tezliklə)"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--text-secondary)" }}>
                    <CheckCircle size={15} color="#16a34a" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/payments" className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }}>
                Premium al <ArrowRight size={15} />
              </Link>
            </div>

            {/* Teacher */}
            <div className="card animate-fade-up delay-2" style={{ padding:32 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--text-muted)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Müəllim</p>
              <div style={{ fontSize:40, fontWeight:800, fontFamily:"Syne, sans-serif", color:"var(--text-primary)", marginBottom:4 }}>Pulsuz</div>
              <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>Kurs yarat, qazanc qazan</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {["Limitsiz kurs yarat","AI Quiz Generator","Şagird analitikası","Sertifikat sistemi","Giriş kodu sistemi"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--text-secondary)" }}>
                    <CheckCircle size={15} color="#16a34a" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn btn-secondary" style={{ width:"100%", justifyContent:"center" }}>
                Müəllim kimi qoşul
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div className="tag animate-fade-up" style={{ marginBottom:12, display:"inline-flex" }}>
              <MessageSquare size={12} /> FAQ
            </div>
            <h2 className="animate-fade-up delay-1" style={{ fontSize:"clamp(28px,4vw,40px)", marginBottom:10 }}>
              Tez-tez soruşulan suallar
            </h2>
          </div>

          <div style={{ maxWidth:720, margin:"0 auto" }}>
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="accordion-item animate-fade-up">
                <button className="accordion-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{q}</span>
                  {openFaq === i ? <ChevronUp size={18} color="var(--accent)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>
                {openFaq === i && (
                  <div className="accordion-content animate-fade-in">{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ background:"linear-gradient(135deg, var(--accent) 0%, #e8741a 60%, #e87040 100%)", borderRadius:24, padding:"clamp(48px,6vw,80px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-80, right:-80, width:320, height:320, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-60, left:-40, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div className="tag" style={{ marginBottom:20, display:"inline-flex", background:"rgba(255,255,255,0.2)", color:"white", border:"1px solid rgba(255,255,255,0.3)" }}>
                <Sparkles size={12} /> Hər kəs üçün
              </div>
              <h2 style={{ fontSize:"clamp(30px,4vw,48px)", color:"white", marginBottom:16 }}>
                {t("cta_title")}
              </h2>
              <p style={{ color:"rgba(255,255,255,0.85)", fontSize:17, marginBottom:36, maxWidth:480, margin:"0 auto 36px" }}>
                {t("cta_desc")}
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <Link href="/register" className="btn" style={{ background:"white", color:"var(--accent)", fontSize:15, padding:"13px 32px", fontWeight:700 }}>
                  {t("cta_btn")} <ArrowRight size={17} />
                </Link>
                <Link href="/courses" className="btn" style={{ background:"rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.3)", fontSize:15, padding:"13px 24px" }}>
                  Kurslara bax
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ background:"var(--bg-card)", borderTop:"1px solid var(--border)", paddingTop:48, paddingBottom:32 }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            {/* Brand */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, background:"var(--accent)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <GraduationCap size={19} color="white" />
                </div>
                <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:20, color:"var(--text-primary)" }}>
                  Edu<span style={{ color:"var(--accent)" }}>Flow</span>
                </span>
              </div>
              <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, maxWidth:280 }}>
                AI dəstəkli müasir öyrənmə platforması. Bilik, bacarıq, karyera — hamısı bir yerdə.
              </p>
            </div>

            {/* Links */}
            {[
              { title:"Platform", links:["Kurslar","Sertifikatlar","AI Tutor","Ödənişlər"] },
              { title:"Müəllim",  links:["Müəllim paneli","Kurs yarat","AI Quiz","Kod idarəsi"] },
              { title:"Şirkət",   links:["Haqqımızda","Blog","Əlaqə","Məxfilik siyasəti"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:14, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {title}
                </h4>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {links.map(l => (
                    <Link key={l} href="#" style={{ fontSize:13, color:"var(--text-secondary)", textDecoration:"none", transition:"color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}>
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop:"1px solid var(--border)", paddingTop:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:13, color:"var(--text-muted)" }}>© 2025 EduFlow. {t("rights")}</p>
            <div style={{ display:"flex", gap:16 }}>
              {["Məxfilik","Şərtlər","Cookies"].map(l => (
                <Link key={l} href="#" style={{ fontSize:13, color:"var(--text-muted)", textDecoration:"none" }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
