"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const TOOLTIP = {
  background: "#111827",
  border: "1px solid #1f2d45",
  borderRadius: 8,
  color: "#f0f4ff",
  fontSize: 12,
};

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
              <span className="font-semibold" style={{ color: "#6366f1" }}>🎵 {fmt(producto.tiktokVistas)} vistas</span>
              <span className="font-semibold" style={{ color: "#22d3ee" }}>📣 {producto.metaAnunciosCount} ads</span>
              {producto.precioProveedor != null && (
                <span className="font-semibold" style={{ color: "#10b981" }}>💰 ${producto.precioProveedor.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {producto.tiktokVideoUrl && (
            <a href={producto.tiktokVideoUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
              style={{ background: "var(--accent)", color: "#fff" }}>
              🎵 Ver en TikTok
            </a>
          )}
          {producto.proveedorUrl && (
            <a href={producto.proveedorUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity border"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Ver proveedor
            </a>
          )}
        </div>
      </div>

      {/* Filtro */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Evolución histórica</h2>
        <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      {metricas.length === 0 ? (
        <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
          Sin datos históricos para este período.
        </p>
      ) : (
        <>
          {/* Gráfico TikTok — Area */}
          <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
              🎵 Vistas en TikTok
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={metricas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tikGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#6b7fa3" }} tickFormatter={formatFecha} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7fa3" }} tickFormatter={v => fmt(Number(v))} width={40} />
                <Tooltip contentStyle={TOOLTIP} formatter={(v) => [fmt(Number(v)), "Vistas"]} labelFormatter={l => formatFecha(String(l))} />
                <Area type="monotone" dataKey="tiktokVistas" stroke="#6366f1" strokeWidth={2} fill="url(#tikGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico Meta Ads — Barras */}
          <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
              📣 Anuncios activos en Meta
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={metricas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#6b7fa3" }} tickFormatter={formatFecha} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7fa3" }} width={36} />
                <Tooltip contentStyle={TOOLTIP} formatter={(v) => [v, "Anuncios"]} labelFormatter={l => formatFecha(String(l))} />
                <Bar dataKey="metaAnuncios" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico Google Trends — Area */}
          <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
              🔍 Interés en Google Trends (0–100)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={metricas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#6b7fa3" }} tickFormatter={formatFecha} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7fa3" }} domain={[0, 100]} width={30} />
                <Tooltip contentStyle={TOOLTIP} formatter={(v) => [v, "Interés"]} labelFormatter={l => formatFecha(String(l))} />
                <Area type="monotone" dataKey="googleTrends" stroke="#10b981" strokeWidth={2} fill="url(#gGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
