"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import Analytics from "@/components/Analytics";
import type { Producto } from "@/lib/types";
import { linkAliExpress, linkCJ, calcularMargen } from "@/lib/proveedores";

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

  const margen = producto ? calcularMargen(producto.precioVenta, producto.precioProveedor) : null;

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
            </div>

            {/* Desglose de margen */}
            {margen ? (
              <div className="rounded-xl border p-3 mt-1" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.3)" }}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Costo (CJ)</p>
                    <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>${producto.precioProveedor!.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Venta (Amazon)</p>
                    <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>${producto.precioVenta!.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Margen</p>
                    <p className="text-base font-bold" style={{ color: "var(--green)" }}>+${margen.ganancia.toFixed(2)} <span className="text-xs">({margen.porcentaje.toFixed(0)}%)</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 text-sm mt-1">
                {producto.precioVenta != null && producto.precioVenta > 0 && (
                  <span className="font-semibold" style={{ color: "#10b981" }}>💰 Venta ${producto.precioVenta.toFixed(2)}</span>
                )}
                <span style={{ color: "var(--text-muted)" }}>Costo del proveedor: buscá abajo en CJ/AliExpress</span>
              </div>
            )}
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
