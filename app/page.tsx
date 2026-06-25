"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";
import { calcularMargen, scoreOportunidad } from "@/lib/proveedores";

type Orden = "oportunidad" | "margen" | "metaAds" | "reviews" | "reciente";

const ORDENES: { label: string; value: Orden }[] = [
  { label: "🔥 Oportunidad", value: "oportunidad" },
  { label: "💰 Mejor margen", value: "margen" },
  { label: "📣 Más anuncios", value: "metaAds" },
  { label: "⭐ Más reviews", value: "reviews" },
  { label: "🆕 Más reciente", value: "reciente" },
];

function valorOrden(p: Producto, orden: Orden): number {
  switch (orden) {
    case "oportunidad": return scoreOportunidad(p);
    case "margen": return calcularMargen(p.precioVenta, p.precioProveedor)?.ganancia ?? -1;
    case "metaAds": return p.metaAnunciosCount;
    case "reviews": return p.tiktokVistas;
    case "reciente": return new Date(p.actualizadoEn).getTime();
  }
}

export default function FeedPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [periodo, setPeriodo] = useState(30);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>("Todas");
  const [orden, setOrden] = useState<Orden>("oportunidad");

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

  // Categorías disponibles a partir de los productos
  const categorias = useMemo(() => {
    const set = new Set(productos.map(p => p.categoria).filter(Boolean) as string[]);
    return ["Todas", ...Array.from(set).sort()];
  }, [productos]);

  const visibles = useMemo(() => {
    const filtrados = categoria === "Todas"
      ? productos
      : productos.filter(p => p.categoria === categoria);
    return [...filtrados].sort((a, b) => valorOrden(b, orden) - valorOrden(a, orden));
  }, [productos, categoria, orden]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            🔥 Productos Trending
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {loading ? "Cargando..." : `${visibles.length} productos${categoria !== "Todas" ? ` en ${categoria}` : " de Amazon Best Sellers"}`}
          </p>
        </div>
        <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      {/* Controles: categorías + orden */}
      {!loading && productos.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Chips de categoría */}
          <div className="flex flex-wrap gap-2">
            {categorias.map(c => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={categoria === c
                  ? { background: "var(--accent)", color: "#fff" }
                  : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Selector de orden */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ordenar por:</span>
            {ORDENES.map(o => (
              <button
                key={o.value}
                onClick={() => setOrden(o.value)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={orden === o.value
                  ? { background: "var(--bg-card2)", color: "var(--text-primary)", border: "1px solid var(--accent)" }
                  : { color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="aspect-square" style={{ background: "var(--bg-card2)" }} />
              <div className="p-4 space-y-3">
                <div className="h-4 rounded w-3/4" style={{ background: "var(--bg-card2)" }} />
                <div className="h-12 rounded" style={{ background: "var(--bg-card2)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          <p className="text-5xl mb-4">📭</p>
          <p className="text-sm">No hay productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibles.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  );
}
