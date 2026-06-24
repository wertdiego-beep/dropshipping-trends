import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropTrends — Productos Trending",
  description: "Detectá productos virales en TikTok con datos de proveedor y anuncios en Meta.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: "var(--bg-base)" }} className="min-h-screen">
        <header className="border-b px-5 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <a href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            <span>🔥</span> DropTrends
          </a>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}>
            🟢 En vivo
          </span>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
