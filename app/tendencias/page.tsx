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

interface Seguido {
  id: string;
  hashtag: string;
  vistas: number | null;
  posts: number | null;
  enTrending: boolean;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Hashtags clásicos de dropshipping (sugeridos para seguir)
const SUGERIDOS = [
  "TikTokMadeMeBuyIt", "TikTokmehizocomprarlo", "TikTokShopFinds", "AmazonFinds",
  "ViralProducts", "ProductosVirales", "SmallBusinessCheck", "PackingOrders",
  "PackOrders", "AmazonMustHaves", "GadgetsThatWork", "UsefulGadgets", "OddlySatisfying",
];

export default function TendenciasPage() {
  const [tendencias, setTendencias] = useState<Tendencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [seguidos, setSeguidos] = useState<Seguido[]>([]);
  const [nuevo, setNuevo] = useState("");
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    fetch("/api/tendencias")
      .then(r => r.json())
      .then(setTendencias)
      .finally(() => setLoading(false));
    cargarSeguidos();
  }, []);

  function cargarSeguidos() {
    fetch("/api/hashtags-seguidos").then(r => r.json()).then(setSeguidos);
  }

  async function agregarHashtag(e: React.FormEvent) {
    e.preventDefault();
    const h = nuevo.trim();
    if (h.length < 2) return;
    setAgregando(true);
    try {
      await fetch("/api/hashtags-seguidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtag: h }),
      });
      setNuevo("");
      cargarSeguidos();
    } finally {
      setAgregando(false);
    }
  }

  async function quitarHashtag(id: string) {
    await fetch(`/api/hashtags-seguidos?id=${id}`, { method: "DELETE" });
    cargarSeguidos();
  }

  async function agregarSugerido(hashtag: string) {
    await fetch("/api/hashtags-seguidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hashtag }),
    });
    cargarSeguidos();
  }

  // Sugeridos que todavía no están en la lista del usuario
  const seguidosSet = new Set(seguidos.map(s => s.hashtag.toLowerCase()));
  const sugeridosDisponibles = SUGERIDOS.filter(s => !seguidosSet.has(s.toLowerCase()));

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

      {/* Mis hashtags — el usuario sigue los de su nicho */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>📌 Mis hashtags</h2>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          Agregá los hashtags de tu nicho. Tocá uno para ver sus videos virales en TikTok.
        </p>
        <form onSubmit={agregarHashtag} className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>#</span>
            <input
              value={nuevo}
              onChange={e => setNuevo(e.target.value)}
              placeholder="ledlights, kitchengadgets, pettoys..."
              className="w-full rounded-lg py-2 pl-7 pr-3 text-sm outline-none"
              style={{ background: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <button type="submit" disabled={agregando}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Agregar
          </button>
        </form>

        {/* Sugeridos de dropshipping */}
        {sugeridosDisponibles.length > 0 && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Sugeridos para dropshipping (tocá para agregar):</p>
            <div className="flex flex-wrap gap-1.5">
              {sugeridosDisponibles.map(s => (
                <button key={s} onClick={() => agregarSugerido(s)}
                  className="text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: "var(--bg-base)", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
                  + #{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {seguidos.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Todavía no seguís ningún hashtag.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {seguidos.map(s => (
              <div key={s.id} className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "var(--bg-card2)" }}>
                <a href={`https://www.tiktok.com/tag/${s.hashtag}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium hover:opacity-80" style={{ color: "var(--accent2)" }}>
                  #{s.hashtag}
                </a>
                {s.enTrending && s.vistas != null && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)", color: "var(--green)" }}>
                    🔥 {fmt(s.vistas)}
                  </span>
                )}
                <button onClick={() => quitarHashtag(s.id)} className="text-xs hover:opacity-70" style={{ color: "var(--text-muted)" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-sm font-semibold pt-2" style={{ color: "var(--text-primary)" }}>🔥 Trending ahora</h2>

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
