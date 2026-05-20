"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft, Plus, ClipboardList, Timer, Award,
  Users, Loader2, Trash2, BarChart2
} from "lucide-react";

export default function CourseQuizzesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    Promise.all([
      api.get(`/api/courses/public/${id}`),
      api.get(`/api/courses/${id}/quizzes`),
    ])
      .then(([courseRes, quizRes]) => {
        setCourse(courseRes.data);
        setQuizzes(quizRes.data || []);
      })
      .catch(() => router.push("/dashboard/teacher"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const deleteQuiz = async (quizId: number) => {
    if (!confirm("Bu quizi silmək istədiyinizə əminsiniz?")) return;
    setDeleting(quizId);
    try {
      await api.delete(`/api/quizzes/${quizId}`);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (e: any) {
      alert(e.response?.data?.error || "Xəta baş verdi");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="page" style={{ paddingTop: 80 }}>
      <div className="container section">
        {[1, 2, 3].map(i => (
          <div key={i} className="card skeleton" style={{ height: 90, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "32px 0" }}>
        <div className="container">
          <button onClick={() => router.back()} className="btn btn-ghost"
            style={{ fontSize: 13, padding: "6px 12px", marginBottom: 16, display: "inline-flex" }}>
            <ArrowLeft size={14} /> Geri
          </button>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{course?.title}</p>
              <h1 style={{ fontSize: 26, marginBottom: 4 }}>Quizlər</h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {quizzes.length} quiz
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/dashboard/teacher/quiz/create?courseId=${id}`}
                className="btn btn-secondary"
                style={{ fontSize: 13 }}
              >
                <Plus size={14} /> Manual Quiz
              </Link>
              <Link
                href={`/dashboard/teacher/ai-quiz?courseId=${id}`}
                className="btn btn-primary"
                style={{ fontSize: 13 }}
              >
                ✨ AI Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {quizzes.length === 0 ? (
            <div className="card" style={{ padding: "60px", textAlign: "center" }}>
              <ClipboardList size={40} style={{ margin: "0 auto 16px", opacity: 0.25, color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 15 }}>
                Hələ quiz yoxdur
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href={`/dashboard/teacher/quiz/create?courseId=${id}`} className="btn btn-secondary" style={{ fontSize: 13 }}>
                  <Plus size={14} /> Manual Quiz yarat
                </Link>
                <Link href={`/dashboard/teacher/ai-quiz?courseId=${id}`} className="btn btn-primary" style={{ fontSize: 13 }}>
                  ✨ AI ilə Quiz yarat
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {quizzes.map((quiz: any, i: number) => (
                <div key={quiz.id} className="card animate-fade-up"
                  style={{ padding: "20px 24px", animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "var(--accent-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <ClipboardList size={20} color="var(--accent)" />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                          {quiz.title}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <ClipboardList size={11} />
                            {quiz.questionsCount || quiz._count?.questions || 0} sual
                          </span>
                          {quiz.timeLimit && (
                            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Timer size={11} />
                              {quiz.timeLimit} dəq
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Award size={11} />
                            Keçid: {quiz.passingScore}%
                          </span>
                          {(quiz.attemptsCount || quiz._count?.attempts) > 0 && (
                            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Users size={11} />
                              {quiz.attemptsCount || quiz._count?.attempts} cəhd
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Link
                        href={`/quiz/${quiz.id}`}
                        className="btn btn-ghost"
                        style={{ fontSize: 12, padding: "6px 12px" }}
                      >
                        <BarChart2 size={13} /> Bax
                      </Link>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        disabled={deleting === quiz.id}
                        className="btn btn-ghost"
                        style={{ fontSize: 12, padding: "6px 10px", color: "#ef4444" }}
                      >
                        {deleting === quiz.id
                          ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
