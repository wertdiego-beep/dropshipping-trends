"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GraficoMetricas from "@/components/GraficoMetricas";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card2)", borderColor: "var(--border)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: color ?? "var(--text-primary)" }}>{value}</p>
    </div>
  );
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

  const metricasFiltradas = (producto?.metricas ?? []).filter(m => {
    const limite = new Date();
    limite.setDate(limite.getDate() - periodo);
    return new Date(m.fecha) >= limite;
  });

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 rounded w-1/4" style={{ background: "var(--bg-card)" }} />
      <div className="h-40 rounded-xl" style={{ background: "var(--bg-card)" }} />
      <div className="h-64 rounded-xl" style={{ background: "var(--bg-card)" }} />
    </div>
  );

  if (!producto) return (
    <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
      <p className="text-5xl mb-4">❌</p>
      <p className="mb-4">Producto no encontrado</p>
      <Link href="/" className="text-sm" style={{ color: "var(--accent)" }}>← Volver al dashboard</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/" className="text-sm flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: "var(--text-muted)" }}>
        ← Dashboard
      </Link>

      {/* Producto info */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex flex-col sm:flex-row gap-5">
          {producto.imagen && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--bg-card2)" }}>
              <Image src={producto.imagen} alt={producto.nombre} fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1 space-y-3">
            {producto.categoria && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent)" }}>
                {producto.categoria}
              </span>
            )}
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{producto.nombre}</h1>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Vistas TikTok" value={fmt(producto.tiktokVistas)} color="var(--accent)" />
              <Stat label="Ads en Meta" value={String(producto.metaAnunciosCount)} color="var(--accent2)" />
              <Stat label={`Precio (${producto.proveedorNombre})`} value={producto.precioProveedor != null ? `$${producto.precioProveedor.toFixed(2)}` : "—"} color="var(--green)" />
            </div>
            <div className="flex gap-3 pt-1">
              {producto.tiktokVideoUrl && (
                <a href={producto.tiktokVideoUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity"
                  style={{ background: "var(--accent)", color: "#fff" }}>
                  Ver en TikTok ↗
                </a>
              )}
              {producto.proveedorUrl && (
                <a href={producto.proveedorUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity border"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  Ver proveedor ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Evolución histórica</h2>
          <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
        </div>
        <GraficoMetricas metricas={metricasFiltradas} nombre={producto.nombre} />
      </div>
    </div>
  );
}
