"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GraficoMetricas from "@/components/GraficoMetricas";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);

  useEffect(() => {
    fetch(`/api/productos/${id}`)
      .then((r) => r.json())
      .then(setProducto)
      .finally(() => setLoading(false));
  }, [id]);

  const metricasFiltradas = (producto?.metricas ?? []).filter((m) => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - periodo);
    return new Date(m.fecha) >= fechaLimite;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">❌</p>
        <p className="text-lg font-medium text-gray-600">Producto no encontrado</p>
        <Link href="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          ← Volver al feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">
        ← Volver al feed
      </Link>

      {/* Card de producto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Imagen */}
          {producto.imagen && (
            <div className="relative sm:w-56 aspect-[4/3] sm:aspect-auto flex-shrink-0 bg-gray-100">
              <Image
                src={producto.imagen}
                alt={producto.nombre}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Info */}
          <div className="p-6 flex-1 space-y-4">
            {producto.categoria && (
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {producto.categoria}
              </span>
            )}
            <h1 className="text-xl font-bold text-gray-900">{producto.nombre}</h1>

            <div className="grid grid-cols-3 gap-3">
              <Stat emoji="🎵" label="Vistas TikTok" value={fmt(producto.tiktokVistas)} />
              <Stat emoji="📣" label="Ads en Meta" value={String(producto.metaAnunciosCount)} />
              {producto.precioProveedor != null && (
                <Stat
                  emoji="💰"
                  label={producto.proveedorNombre}
                  value={`$${producto.precioProveedor.toFixed(2)}`}
                  accent
                />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {producto.tiktokVideoUrl && (
                <a
                  href={producto.tiktokVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Ver en TikTok
                </a>
              )}
              {producto.proveedorUrl && (
                <a
                  href={producto.proveedorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Ver proveedor
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Evolución histórica</h2>
          <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
        </div>
        <GraficoMetricas metricas={metricasFiltradas} />
      </div>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Stat({
  emoji,
  label,
  value,
  accent,
}: {
  emoji: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1">
        {emoji} {label}
      </p>
      <p className={`text-lg font-bold ${accent ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
