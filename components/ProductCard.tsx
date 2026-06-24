"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ProductCard({ producto }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/producto/${producto.id}`)}
      className="cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "var(--bg-card2)" }}>
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {producto.categoria && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
            {producto.categoria}
          </span>
        )}
        {/* Badge de vistas */}
        <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(99,102,241,0.85)", color: "#fff" }}>
          🎵 {fmt(producto.tiktokVistas)}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>
          {producto.nombre}
        </h3>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg px-3 py-2" style={{ background: "var(--bg-card2)" }}>
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Meta Ads</p>
            <p className="text-sm font-bold" style={{ color: "var(--accent2)" }}>
              📣 {produto_meta(producto.metaAnunciosCount)}
            </p>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: "var(--bg-card2)" }}>
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Proveedor</p>
            <p className="text-sm font-bold" style={{ color: "var(--green)" }}>
              {producto.precioProveedor != null ? `$${producto.precioProveedor.toFixed(2)}` : "—"}
            </p>
          </div>
        </div>

        {/* Ver video */}
        {producto.tiktokVideoUrl && (
          <a
            href={producto.tiktokVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="block text-center text-xs py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Ver video en TikTok ↗
          </a>
        )}
      </div>
    </div>
  );
}

function produto_meta(n: number) {
  if (n > 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
