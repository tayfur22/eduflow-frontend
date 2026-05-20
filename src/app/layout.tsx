"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import Navbar from "@/components/layout/Navbar";
import ToastContainer from "@/components/shared/Toast";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { initTheme } = useThemeStore();
  const { initAuth } = useAuthStore();
  const { initLang } = useLangStore();

  useEffect(() => {
    initTheme();
    initAuth();
    initLang();
  }, []);

  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <title>EduFlow — Online Təhsil Platforması</title>
        <meta name="description" content="Professional online kurs platforması" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise">
        <Navbar />
        <main style={{ paddingTop: 64 }}>
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
