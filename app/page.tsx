"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import type { Producto } from "@/lib/types";

export default function FeedPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [periodo, setPeriodo] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async (dias: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/productos?dias=${dias}`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos(periodo);
  }, [periodo, fetchProductos]);

  return (
    <div>
      {/* Header del feed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos Trending</h1>
          <p className="text-sm text-gray-500 mt-1">
            {productos.length > 0
              ? `${productos.length} productos detectados`
              : "Cargando datos..."}
          </p>
        </div>
        <FiltrosPeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      {/* Estados */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium text-gray-600">No hay productos aún</p>
          <p className="text-sm mt-2">
            Ejecutá el scraper para empezar a detectar tendencias.
          </p>
          <code className="mt-4 inline-block bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg">
            npx ts-node jobs/daily.ts
          </code>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
