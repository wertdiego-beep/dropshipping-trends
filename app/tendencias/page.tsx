"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tendencia {
  id: string;
  hashtag: string;
  posts: number;
  vistas: number;
  categoria: string;
  fecha: string;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function TendenciasPage() {
  const [tendencias, setTendencias] = useState<Tendencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tendencias")
      .then(r => r.json())
      .then(setTendencias)
      .finally(() => setLoading(false));
  }, []);

  const maxVistas = Math.max(...tendencias.map(t => t.vistas), 1);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          🎵 Tendencias TikTok
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Hashtags que están explotando ahora en TikTok (TikTok Creative Center). Usalos para detectar qué productos buscar.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
          ))}
        </div>
      ) : tendencias.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <p className="text-4xl mb-3">🎵</p>
          <p className="text-sm">Todavía no hay tendencias cargadas. El próximo scraping las trae.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          {tendencias.map((t, i) => {
            const slug = t.hashtag.replace(/^#/, "").toLowerCase();
            return (
              <a
                key={t.id}
                href={`https://www.tiktok.com/tag/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-4 py-3 border-b transition-colors hover:opacity-90"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm font-bold w-6 shrink-0" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {t.hashtag}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--bg-card2)", color: "var(--text-muted)" }}>
                      {t.categoria}
                    </span>
                  </div>
                  {/* Barra de vistas */}
                  <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card2)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(t.vistas / maxVistas) * 100}%`, background: "linear-gradient(90deg,#6366f1,#22d3ee)" }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "var(--accent2)" }}>{fmt(t.vistas)}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{fmt(t.posts)} posts</p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      <Link href="/" className="text-sm hover:opacity-70 transition-opacity inline-block" style={{ color: "var(--text-muted)" }}>
        ← Volver al feed
      </Link>
    </div>
  );
}
