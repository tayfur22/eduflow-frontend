"use client";

export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Course } from "@/types";
import { Search, BookOpen, ChevronRight, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { CourseCardSkeleton, EmptySearch } from "@/components/ui/Skeletons";

const CATEGORIES = ["Proqramlaşdırma", "Dizayn", "Biznes", "Dil", "Musiqi", "Ümumi"];
const ACCESS_TYPES = [
  { id: "FREE", label: "Pulsuz", className: "badge-free" },
  { id: "PAID", label: "Ödənişli", className: "badge-paid" },
  { id: "CODE_REQUIRED", label: "Kodla", className: "badge-code" },
];
const SORT_OPTIONS = [
  { id: "newest", label: "Ən yeni" },
  { id: "oldest", label: "Ən köhnə" },
  { id: "price_asc", label: "Qiymət ↑" },
  { id: "price_desc", label: "Qiymət ↓" },
];

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state — initialized from URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedAccess, setSelectedAccess] = useState<string[]>(
    searchParams.get("access")?.split(",").filter(Boolean) || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("cat")?.split(",").filter(Boolean) || []
  );
  const [priceMin, setPriceMin] = useState(searchParams.get("min") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("max") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [expandedSections, setExpandedSections] = useState({ access: true, category: true, price: true });

  useEffect(() => {
    api.get("/api/courses/public")
      .then(r => { setCourses(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sync filters → URL
  const syncURL = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedAccess.length) params.set("access", selectedAccess.join(","));
    if (selectedCategories.length) params.set("cat", selectedCategories.join(","));
    if (priceMin) params.set("min", priceMin);
    if (priceMax) params.set("max", priceMax);
    if (sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/courses", { scroll: false });
  }, [search, selectedAccess, selectedCategories, priceMin, priceMax, sort]);

  useEffect(() => { syncURL(); }, [search, selectedAccess, selectedCategories, priceMin, priceMax, sort]);

  // Apply filters
  useEffect(() => {
    let result = [...courses];
    if (search) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.teacherName?.toLowerCase().includes(search.toLowerCase()));
    if (selectedAccess.length) result = result.filter(c => selectedAccess.includes(c.accessType));
    if (priceMin) result = result.filter(c => !c.price || c.price >= Number(priceMin));
    if (priceMax) result = result.filter(c => !c.price || c.price <= Number(priceMax));

    // Sort
    if (sort === "price_asc") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === "price_desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));

    setFiltered(result);
  }, [search, selectedAccess, selectedCategories, priceMin, priceMax, sort, courses]);

  const toggleAccess = (id: string) =>
    setSelectedAccess(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const clearAll = () => {
    setSearch(""); setSelectedAccess([]); setSelectedCategories([]);
    setPriceMin(""); setPriceMax(""); setSort("newest");
  };

  const activeFilterCount = selectedAccess.length + selectedCategories.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  const accessBadge = (course: Course) => ({
    FREE: { label: "Pulsuz", className: "badge-free" },
    PAID: { label: `${course.price} AZN`, className: "badge-paid" },
    CODE_REQUIRED: { label: "Kodla", className: "badge-code" },
  }[course.accessType]);

  const FilterSection = ({ id, title, children }: { id: keyof typeof expandedSections; title: string; children: React.ReactNode }) => (
    <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
      <button
        onClick={() => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "0 0 12px", color: "var(--text-primary)",
          fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}
      >
        {title}
        {expandedSections[id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expandedSections[id] && children}
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "48px 0 28px" }}>
        <div className="container">
          <h1 className="animate-fade-up" style={{ fontSize: "clamp(28px, 5vw, 44px)", marginBottom: 8 }}>
            Bütün kurslar
          </h1>
          <p className="animate-fade-up delay-1" style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24 }}>
            {courses.length} kurs mövcuddur
          </p>

          {/* Search + Sort bar */}
          <div className="animate-fade-up delay-2" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: 240, maxWidth: 420 }}>
              <Search size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Kurs axtar..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="input" style={{ paddingLeft: 40 }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-secondary hide-desktop"
              style={{ gap: 6, position: "relative" }}
            >
              <SlidersHorizontal size={15} />
              Filtrlər
              {activeFilterCount > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sort} onChange={e => setSort(e.target.value)}
              className="input"
              style={{ width: "auto", minWidth: 140, cursor: "pointer" }}
            >
              {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="btn btn-ghost" style={{ fontSize: 13, gap: 4 }}>
                <X size={14} /> Sıfırla ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

            {/* Sidebar — desktop */}
            <aside className="hide-mobile" style={{
              width: 240, flexShrink: 0, position: "sticky", top: 90,
            }}>
              <div className="card" style={{ padding: "20px 20px 8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Filtrlər</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAll} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                      Sıfırla
                    </button>
                  )}
                </div>

                <FilterSection id="access" title="Çatışım növü">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ACCESS_TYPES.map(a => (
                      <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={selectedAccess.includes(a.id)}
                          onChange={() => toggleAccess(a.id)}
                          style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
                        />
                        <span className={`badge ${a.className}`} style={{ cursor: "pointer" }}>{a.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection id="category" title="Kateqoriya">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {CATEGORIES.map(cat => (
                      <label key={cat} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          style={{ width: 15, height: 15, accentColor: "var(--accent)", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: 13, color: selectedCategories.includes(cat) ? "var(--accent)" : "var(--text-secondary)" }}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection id="price" title="Qiymət (AZN)">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number" placeholder="Min"
                      value={priceMin} onChange={e => setPriceMin(e.target.value)}
                      className="input" style={{ padding: "8px 10px", fontSize: 13 }}
                    />
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>–</span>
                    <input
                      type="number" placeholder="Maks"
                      value={priceMax} onChange={e => setPriceMax(e.target.value)}
                      className="input" style={{ padding: "8px 10px", fontSize: 13 }}
                    />
                  </div>
                </FilterSection>
              </div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)" }}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: "absolute", right: 0, top: 0, bottom: 0,
                    width: "80%", maxWidth: 320,
                    background: "var(--bg-card)",
                    padding: "24px 20px",
                    overflowY: "auto",
                    animation: "slideIn 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16 }}>Filtrlər</h3>
                    <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Same filter content */}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 10 }}>Çatışım növü</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ACCESS_TYPES.map(a => (
                        <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input type="checkbox" checked={selectedAccess.includes(a.id)} onChange={() => toggleAccess(a.id)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                          <span className={`badge ${a.className}`}>{a.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 10 }}>Kateqoriya</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {CATEGORIES.map(cat => (
                        <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                          <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                    <button onClick={clearAll} className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Sıfırla</button>
                    <button onClick={() => setSidebarOpen(false)} className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }}>
                      Tətbiq et ({filtered.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Course grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Result count */}
              {!loading && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  {filtered.length} kurs tapıldı
                  {activeFilterCount > 0 && <span style={{ color: "var(--accent)", fontWeight: 600 }}> (filtrli)</span>}
                </p>
              )}

              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {[1,2,3,4,5,6].map(i => <CourseCardSkeleton key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <EmptySearch />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {filtered.map((course, i) => {
                    const badge = accessBadge(course);
                    return (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="card card-interactive animate-fade-up"
                        style={{ textDecoration: "none", display: "block", overflow: "hidden", animationDelay: `${i * 0.04}s`, opacity: 0 }}
                      >
                        <div style={{
                          height: 176,
                          background: course.thumbnailUrl
                            ? `url(${course.thumbnailUrl}) center/cover`
                            : "linear-gradient(135deg, var(--accent-soft), var(--bg-secondary))",
                          position: "relative",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {!course.thumbnailUrl && <BookOpen size={36} color="var(--accent)" style={{ opacity: 0.4 }} />}
                          <div style={{ position: "absolute", top: 12, left: 12 }}>
                            <span className={`badge ${badge?.className}`}>{badge?.label}</span>
                          </div>
                        </div>
                        <div style={{ padding: "16px 18px 18px" }}>
                          <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            {course.teacherName}
                          </p>
                          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 7, lineHeight: 1.3, color: "var(--text-primary)" }}>
                            {course.title}
                          </h3>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {course.description || "Bu kurs haqqında məlumat yoxdur."}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                              <BookOpen size={12} />
                              {course.sections?.length || 0} bölmə
                            </span>
                            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                              Bax <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
