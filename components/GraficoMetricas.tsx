"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MetricaDiaria } from "@/lib/types";

interface Props {
  metricas: MetricaDiaria[];
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

interface ChartCardProps {
  titulo: string;
  emoji: string;
  data: { fecha: string; valor: number }[];
  color: string;
}

function ChartCard({ titulo, emoji, data, color }: ChartCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>{emoji}</span> {titulo}
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={formatFecha}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={formatK}
            width={40}
          />
          <Tooltip
            formatter={(v) => [formatK(Number(v)), ""]}
            labelFormatter={(label) => formatFecha(String(label))}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GraficoMetricas({ metricas }: Props) {
  if (metricas.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        Aún no hay datos históricos para este producto.
      </p>
    );
  }

  const vistasData = metricas.map((m) => ({ fecha: m.fecha, valor: m.tiktokVistas }));
  const trendsData = metricas.map((m) => ({ fecha: m.fecha, valor: m.googleTrends }));
  const adsData = metricas.map((m) => ({ fecha: m.fecha, valor: m.metaAnuncios }));

  return (
    <div className="grid grid-cols-1 gap-4">
      <ChartCard
        titulo="Vistas en TikTok"
        emoji="🎵"
        data={vistasData}
        color="#ff2d55"
      />
      <ChartCard
        titulo="Interés en Google Trends"
        emoji="🔍"
        data={trendsData}
        color="#4f46e5"
      />
      <ChartCard
        titulo="Anuncios activos en Meta"
        emoji="📣"
        data={adsData}
        color="#1877f2"
      />
    </div>
  );
}
