"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { MetricaDiaria } from "@/lib/types";

interface Props {
  metricas: MetricaDiaria[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const TOOLTIP = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text-primary)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
};

type MetricKey = "tiktokVistas" | "metaAnuncios" | "googleTrends";

const METRICAS: Record<MetricKey, { label: string; emoji: string; color: string; tipo: "area" | "bar" }> = {
  tiktokVistas: { label: "Reviews / Popularidad", emoji: "⭐", color: "#6366f1", tipo: "area" },
  metaAnuncios: { label: "Anuncios en Meta", emoji: "📣", color: "#22d3ee", tipo: "bar" },
  googleTrends: { label: "Rating del producto", emoji: "📈", color: "#10b981", tipo: "area" },
};

// Calcula el cambio % entre el primer y último valor del período
function calcularCambio(metricas: MetricaDiaria[], key: MetricKey): { actual: number; cambio: number } {
  if (metricas.length === 0) return { actual: 0, cambio: 0 };
  const primero = metricas[0][key];
  const ultimo = metricas[metricas.length - 1][key];
  const actual = ultimo;
  if (primero === 0) return { actual, cambio: ultimo > 0 ? 100 : 0 };
  const cambio = ((ultimo - primero) / primero) * 100;
  return { actual, cambio };
}

function KpiCard({
  metricaKey, metricas, activa, onClick,
}: {
  metricaKey: MetricKey;
  metricas: MetricaDiaria[];
  activa: boolean;
  onClick: () => void;
}) {
  const { label, emoji, color } = METRICAS[metricaKey];
  const { actual, cambio } = calcularCambio(metricas, metricaKey);
  const sube = cambio >= 0;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
      style={{
        background: "var(--bg-card)",
        borderColor: activa ? color : "var(--border)",
        boxShadow: activa ? `0 0 0 1px ${color}` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {emoji} {label}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {fmt(actual)}
        </p>
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
          style={{
            background: sube ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
            color: sube ? "var(--green)" : "var(--red)",
          }}
        >
          {sube ? "▲" : "▼"} {Math.abs(cambio).toFixed(0)}%
        </span>
      </div>
      {/* Mini sparkline */}
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={metricas} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey={metricaKey} stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </button>
  );
}

export default function Analytics({ metricas }: Props) {
  const [activa, setActiva] = useState<MetricKey>("tiktokVistas");

  if (metricas.length === 0) {
    return (
      <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
        Sin datos históricos para este período.
      </p>
    );
  }

  const cfg = METRICAS[activa];
  const valores = metricas.map(m => m[activa]);
  const pico = Math.max(...valores);
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const { cambio } = calcularCambio(metricas, activa);
  const sube = cambio >= 0;

  return (
    <div className="space-y-4">
      {/* KPI cards — clickeables para cambiar el gráfico principal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(METRICAS) as MetricKey[]).map(k => (
          <KpiCard key={k} metricaKey={k} metricas={metricas} activa={activa === k} onClick={() => setActiva(k)} />
        ))}
      </div>

      {/* Gráfico principal grande — estilo Kalodata */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span>{cfg.emoji}</span> {cfg.label}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>Pico: <b style={{ color: "var(--text-primary)" }}>{fmt(pico)}</b></span>
              <span>Promedio: <b style={{ color: "var(--text-primary)" }}>{fmt(promedio)}</b></span>
              <span className="flex items-center gap-1" style={{ color: sube ? "var(--green)" : "var(--red)" }}>
                {sube ? "▲" : "▼"} {Math.abs(cambio).toFixed(0)}% en el período
              </span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          {cfg.tipo === "bar" ? (
            <BarChart data={metricas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={formatFecha} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={40} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "rgba(99,102,241,0.06)" }} formatter={(v) => [fmt(Number(v)), cfg.label]} labelFormatter={l => formatFecha(String(l))} />
              <Bar dataKey={activa} fill={cfg.color} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          ) : (
            <AreaChart data={metricas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={formatFecha} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => fmt(Number(v))} width={40} axisLine={false} tickLine={false} domain={activa === "googleTrends" ? [0, 100] : undefined} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ stroke: cfg.color, strokeWidth: 1, strokeDasharray: "4 4" }} formatter={(v) => [fmt(Number(v)), cfg.label]} labelFormatter={l => formatFecha(String(l))} />
              <Area type="monotone" dataKey={activa} stroke={cfg.color} strokeWidth={2.5} fill="url(#mainGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
