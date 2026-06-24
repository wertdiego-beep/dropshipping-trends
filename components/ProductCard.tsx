"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
}

function formatVistas(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ProductCard({ producto }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/producto/${producto.id}`)}
      className="block group cursor-pointer">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Imagen / video thumbnail */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}
          {producto.categoria && (
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {producto.categoria}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
            {producto.nombre}
          </h3>

          <div className="flex items-center justify-between text-sm">
            {/* Vistas TikTok */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="text-base">🎵</span>
              <span className="font-medium text-gray-700">
                {formatVistas(producto.tiktokVistas)}
              </span>
              <span className="text-xs">vistas</span>
            </div>

            {/* Meta ads */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="text-base">📣</span>
              <span className="font-medium text-gray-700">
                {producto.metaAnunciosCount}
              </span>
              <span className="text-xs">ads</span>
            </div>
          </div>

          {/* Precio proveedor */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            {producto.precioProveedor != null ? (
              <div>
                <p className="text-xs text-gray-400">{producto.proveedorNombre}</p>
                <p className="text-lg font-bold text-emerald-600">
                  ${producto.precioProveedor.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin precio</p>
            )}

            {producto.tiktokVideoUrl && (
              <a
                href={producto.tiktokVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Ver video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
