"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { linkAliExpress, linkCJ, calcularMargen, scoreOportunidad } from "@/lib/proveedores";

interface Props {
  producto: Producto;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ProductCard({ producto }: Props) {
  const router = useRouter();
  const link = producto.proveedorUrl ?? producto.tiktokVideoUrl;
  const margen = calcularMargen(producto.precioVenta, producto.precioProveedor);
  const score = scoreOportunidad(producto);

  return (
    <div
      onClick={() => router.push(`/producto/${producto.id}`)}
      className="cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden flex items-center justify-center" style={{ background: "#ffffff" }}>
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-contain p-4"
            unoptimized
          />
        ) : (
          <div className="text-4xl">📦</div>
        )}
        {producto.categoria && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            {producto.categoria}
          </span>
        )}
        {score >= 50 && (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: "linear-gradient(90deg,#f43f5e,#f59e0b)", color: "#fff" }}>
            🔥 {score >= 70 ? "HOT" : "Oportunidad"}
          </span>
        )}
        <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(99,102,241,0.9)", color: "#fff" }}>
          ⭐ {fmt(producto.tiktokVistas)} reviews
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 h-10" style={{ color: "var(--text-primary)" }}>
          {producto.nombre}
        </h3>

        {/* Margen: venta (Amazon) vs costo (CJ) */}
        {margen ? (
          <div className="rounded-lg px-3 py-2" style={{ background: "rgba(16,185,129,0.1)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Margen</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--green)", color: "#04130d" }}>
                +{margen.porcentaje.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-sm">
              <span style={{ color: "var(--text-muted)" }}>
                ${producto.precioProveedor!.toFixed(2)} → <b style={{ color: "var(--text-primary)" }}>${producto.precioVenta!.toFixed(2)}</b>
              </span>
              <span className="font-bold" style={{ color: "var(--green)" }}>
                +${margen.ganancia.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg px-3 py-2" style={{ background: "var(--bg-card2)" }}>
              <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Venta</p>
              <p className="text-sm font-bold" style={{ color: "var(--green)" }}>
                {producto.precioVenta ? `$${producto.precioVenta.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: "var(--bg-card2)" }}>
              <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Meta Ads</p>
              <p className="text-sm font-bold" style={{ color: "var(--accent2)" }}>
                📣 {fmt(producto.metaAnunciosCount)}
              </p>
            </div>
          </div>
        )}

        {/* Buscar proveedor */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={linkAliExpress(producto.nombre)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-center text-xs py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,79,0,0.15)", color: "#ff6a2b" }}
          >
            AliExpress ↗
          </a>
          <a
            href={linkCJ(producto.nombre)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-center text-xs py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: "rgba(34,211,238,0.15)", color: "var(--accent2)" }}
          >
            CJ Dropshipping ↗
          </a>
        </div>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="block text-center text-xs py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Ver en {producto.proveedorNombre} ↗
          </a>
        )}
      </div>
    </div>
  );
}
