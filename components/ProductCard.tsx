"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
  rank: number;
}

function formatVistas(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ProductCard({ producto, rank }: Props) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/producto/${producto.id}`)}
      className="cursor-pointer transition-colors border-b"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card2)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-sm font-bold w-10" style={{ color: "var(--text-muted)" }}>
        #{rank}
      </td>

      {/* Producto */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg-card2)" }}>
            {producto.imagen ? (
              <Image src={producto.imagen} alt={producto.nombre} fill className="object-cover" unoptimized />
            ) : (
              <span className="flex items-center justify-center h-full text-lg">📦</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
              {producto.nombre}
            </p>
            {producto.categoria && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{producto.categoria}</span>
            )}
          </div>
        </div>
      </td>

      {/* Vistas TikTok */}
      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--accent2)" }}>
        🎵 {formatVistas(producto.tiktokVistas)}
      </td>

      {/* Precio */}
      <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--green)" }}>
        {producto.precioProveedor != null ? `$${producto.precioProveedor.toFixed(2)}` : "—"}
      </td>

      {/* Meta Ads */}
      <td className="px-4 py-3 text-sm" style={{ color: "var(--text-primary)" }}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: producto.metaAnunciosCount > 500 ? "var(--green)" : "var(--text-muted)" }} />
          {producto.metaAnunciosCount.toLocaleString()}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {producto.tiktokVideoUrl && (
            <a
              href={producto.tiktokVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs px-2 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
              style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent)" }}
            >
              TikTok ↗
            </a>
          )}
          {producto.proveedorUrl && (
            <a
              href={producto.proveedorUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs px-2 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
              style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}
            >
              Proveedor ↗
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
