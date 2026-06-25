"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";

export default function FeedPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [periodo, setPeriodo] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchProductos = useCallback(async (dias: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/productos?dias=${dias}`);
      setProductos(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProductos(periodo); }, [periodo, fetchProductos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            🔥 Productos Trending
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {loading ? "Cargando..." : `${productos.length} productos de Amazon Best Sellers`}
          </p>
        </div>
        <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="aspect-[4/3]" style={{ background: "var(--bg-card2)" }} />
              <div className="p-4 space-y-3">
                <div className="h-4 rounded w-3/4" style={{ background: "var(--bg-card2)" }} />
                <div className="h-12 rounded" style={{ background: "var(--bg-card2)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          <p className="text-5xl mb-4">📭</p>
          <p className="text-sm">No hay productos aún. Ejecutá el scraper primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {productos.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  );
}
