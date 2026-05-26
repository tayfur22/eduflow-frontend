"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("EduFlow xəta:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#f8f7f4", padding: "40px 24px",
          flexDirection: "column", textAlign: "center",
          fontFamily: "DM Sans, sans-serif",
        }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: "#fef2f2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
            }}>
              <AlertTriangle size={36} color="#dc2626" />
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, color: "#1a1814" }}>
              Bir xəta baş verdi
            </h1>
            <p style={{ color: "#6b6660", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              Narahat olmayın — bu bizim tərəfdən olan bir problemdir.
              Səhifəni yeniləyin və ya ana səhifəyə qayıdın.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 22px", borderRadius: 10,
                  background: "#e8541a", color: "white",
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                }}
              >
                <RefreshCw size={15} />
                Yenidən cəhd et
              </button>
              <Link
                href="/"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 22px", borderRadius: 10,
                  background: "white", color: "#1a1814",
                  border: "1px solid #e8e5df", textDecoration: "none",
                  fontSize: 14, fontWeight: 500,
                }}
              >
                <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} />
                Ana səhifə
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
