"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { MetricaDiaria } from "@/lib/types";

interface Props {
  metricas: MetricaDiaria[];
  nombre: string;
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const TOOLTIP_STYLE = {
  background: "#111827",
  border: "1px solid #1f2d45",
  borderRadius: 8,
  color: "#f0f4ff",
  fontSize: 12,
};

export default function GraficoMetricas({ metricas, nombre }: Props) {
  if (metricas.length === 0) {
    return (
      <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
        Sin datos históricos aún para este producto.
      </p>
    );
  }

  const last = metricas[metricas.length - 1];
  const donutData = [
    { name: "TikTok vistas", value: Math.min(last.tiktokVistas, 20_000_000) },
    { name: "Meta ads", value: last.metaAnuncios * 5000 },
    { name: "Google Trends", value: last.googleTrends * 100000 },
  ];
  const COLORS = ["#6366f1", "#22d3ee", "#10b981"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Donut */}
      <div className="rounded-xl p-5 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
          Distribución de señales
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {donutData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatK(Number(v)), ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Línea TikTok + Meta */}
      <div className="lg:col-span-2 rounded-xl p-5 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
          Evolución — {nombre}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metricas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
            <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#6b7fa3" }} tickFormatter={formatFecha} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7fa3" }} tickFormatter={formatK} width={38} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatK(Number(v)), ""]} labelFormatter={(l) => formatFecha(String(l))} />
            <Line type="monotone" dataKey="tiktokVistas" stroke="#6366f1" strokeWidth={2} dot={false} name="TikTok vistas" />
            <Line type="monotone" dataKey="metaAnuncios" stroke="#22d3ee" strokeWidth={2} dot={false} name="Meta ads" />
            <Line type="monotone" dataKey="googleTrends" stroke="#10b981" strokeWidth={2} dot={false} name="Google Trends" />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
