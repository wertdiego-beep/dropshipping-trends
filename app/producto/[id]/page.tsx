"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import Analytics from "@/components/Analytics";
import type { Producto } from "@/lib/types";
import { linkAliExpress, linkCJ } from "@/lib/proveedores";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);

  useEffect(() => {
    fetch(`/api/productos/${id}`)
      .then(r => r.json())
      .then(setProducto)
      .finally(() => setLoading(false));
  }, [id]);

  const metricas = (producto?.metricas ?? []).filter(m => {
    const limite = new Date();
    limite.setDate(limite.getDate() - periodo);
    return new Date(m.fecha) >= limite;
  });

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
      <div className="h-5 rounded w-24" style={{ background: "var(--bg-card)" }} />
      <div className="h-48 rounded-2xl" style={{ background: "var(--bg-card)" }} />
      <div className="h-56 rounded-2xl" style={{ background: "var(--bg-card)" }} />
    </div>
  );

  if (!producto) return (
    <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
      <p className="text-5xl mb-4">❌</p>
      <Link href="/" style={{ color: "var(--accent)" }}>← Volver</Link>
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <Link href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
        ← Volver al feed
      </Link>

      {/* Header del producto */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex gap-4">
          {producto.imagen && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--bg-card2)" }}>
              <Image src={producto.imagen} alt={producto.nombre} fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {producto.categoria && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent)" }}>
                {producto.categoria}
              </span>
            )}
            <h1 className="text-base font-bold mt-1 mb-3" style={{ color: "var(--text-primary)" }}>
              {producto.nombre}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="font-semibold" style={{ color: "#6366f1" }}>⭐ {fmt(producto.tiktokVistas)} reviews</span>
              <span className="font-semibold" style={{ color: "#22d3ee" }}>📣 {producto.metaAnunciosCount} ads</span>
              {producto.precioProveedor != null && producto.precioProveedor > 0 && (
                <span className="font-semibold" style={{ color: "#10b981" }}>💰 ${producto.precioProveedor.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {producto.proveedorUrl && (
            <a href={producto.proveedorUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
              style={{ background: "var(--accent)", color: "#fff" }}>
              Ver en {producto.proveedorNombre} ↗
            </a>
          )}
          <a href={linkAliExpress(producto.nombre)} target="_blank" rel="noopener noreferrer"
            className="text-xs px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(255,79,0,0.15)", color: "#ff6a2b" }}>
            🔎 Buscar en AliExpress
          </a>
          <a href={linkCJ(producto.nombre)} target="_blank" rel="noopener noreferrer"
            className="text-xs px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(34,211,238,0.15)", color: "var(--accent2)" }}>
            🔎 Buscar en CJ
          </a>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Evolución histórica</h2>
        <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      <Analytics metricas={metricas} />
    </div>
  );
}
