"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function StatCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="text-lg">{emoji}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

export default function FeedPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [periodo, setPeriodo] = useState(30);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const fetchProductos = useCallback(async (dias: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/productos?dias=${dias}`);
      const data = await res.json();
      setProductos(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProductos(periodo); }, [periodo, fetchProductos]);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalVistas = productos.reduce((a, p) => a + p.tiktokVistas, 0);
  const totalAds = productos.reduce((a, p) => a + p.metaAnunciosCount, 0);
  const precioPromedio = productos.filter(p => p.precioProveedor).reduce((a, p, _, arr) =>
    a + (p.precioProveedor! / arr.length), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {productos.length} productos trending detectados
          </p>
        </div>
        <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard emoji="🛍️" label="Productos" value={String(productos.length)} sub="en el período" />
        <StatCard emoji="🎵" label="Vistas TikTok" value={fmt(totalVistas)} sub="acumuladas" />
        <StatCard emoji="📣" label="Anuncios Meta" value={fmt(totalAds)} sub="activos totales" />
        <StatCard emoji="💰" label="Precio promedio" value={precioPromedio > 0 ? `$${precioPromedio.toFixed(2)}` : "—"} sub="costo proveedor" />
      </div>

      {/* Tabla */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Productos Trending</h2>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg outline-none w-48"
            style={{ background: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "var(--bg-card2)" }} />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No hay productos aún. Ejecutá el scraper primero.</p>
            <code className="mt-3 inline-block text-xs px-3 py-2 rounded-lg" style={{ background: "var(--bg-base)", color: "var(--accent)" }}>
              npx ts-node --esm jobs/daily.ts
            </code>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">TikTok</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Meta Ads</th>
                  <th className="px-4 py-3">Links</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p, i) => (
                  <ProductCard key={p.id} producto={p} rank={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
