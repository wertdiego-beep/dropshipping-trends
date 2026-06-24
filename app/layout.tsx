import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropTrends — Panel de Control",
  description: "Detectá productos virales en TikTok con datos de proveedor y anuncios en Meta.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="text-2xl">🔥</span> DropTrends
            </span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80" style={{ background: "var(--accent)", color: "#fff" }}>
              <span>📊</span> Dashboard
            </a>
            <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: "var(--text-muted)" }}>
              <span>🛍️</span> Productos
            </a>
            <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: "var(--text-muted)" }}>
              <span>📈</span> Tendencias
            </a>
            <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: "var(--text-muted)" }}>
              <span>⚙️</span> Configuración
            </a>
          </nav>
          <div className="px-5 py-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Actualizado diariamente
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="lg:hidden font-bold flex items-center gap-2">
              <span>🔥</span> DropTrends
            </div>
            <div className="hidden lg:block text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Panel de control de dropshipping
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent)" }}>
                🟢 Base de datos conectada
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
