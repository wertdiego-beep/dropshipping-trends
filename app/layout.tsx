import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropTrends — Productos Trending para Dropshipping",
  description: "Detectá productos virales en TikTok con datos de proveedor y anuncios en Meta.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
              <span className="text-2xl">🔥</span>
              DropTrends
            </a>
            <span className="text-xs text-gray-400">Actualizado diariamente</span>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
