"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Campos {
  nombre: string;
  categoria: string;
  imagen: string;
  tiktokVideoUrl: string;
  tiktokVistas: string;
  proveedorNombre: string;
  proveedorUrl: string;
  precioProveedor: string;
  precioVenta: string;
  metaAnunciosCount: string;
}

const VACIO: Campos = {
  nombre: "", categoria: "", imagen: "", tiktokVideoUrl: "", tiktokVistas: "",
  proveedorNombre: "", proveedorUrl: "", precioProveedor: "", precioVenta: "", metaAnunciosCount: "",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      {hint && <span className="text-xs block mb-1" style={{ color: "var(--text-muted)" }}>{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function AgregarProducto() {
  const router = useRouter();
  const [campos, setCampos] = useState<Campos>(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCampos(c => ({ ...c, [k]: e.target.value }));

  const inputStyle = {
    background: "var(--bg-base)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (campos.nombre.trim().length < 3) {
      setError("Poné un nombre de producto (mínimo 3 caracteres).");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "No se pudo guardar el producto.");
      }
      const producto = await res.json();
      router.push(`/producto/${producto.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setEnviando(false);
    }
  }

  const inputCls = "w-full rounded-lg py-2 px-3 text-sm outline-none";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
        ← Volver al feed
      </Link>

      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>➕ Agregar producto viral</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Compartí un producto que encontraste, con su proveedor y el video de TikTok.
        </p>
      </div>

      <form onSubmit={enviar} className="space-y-5 rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <Field label="Nombre del producto *">
          <input className={inputCls} style={inputStyle} value={campos.nombre} onChange={set("nombre")} placeholder="Ej: Mini proyector portátil LED" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Categoría">
            <input className={inputCls} style={inputStyle} value={campos.categoria} onChange={set("categoria")} placeholder="Ej: Tecnología" />
          </Field>
          <Field label="URL de la imagen">
            <input className={inputCls} style={inputStyle} value={campos.imagen} onChange={set("imagen")} placeholder="https://..." />
          </Field>
        </div>

        {/* TikTok del producto viral */}
        <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(99,102,241,0.06)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>🎵 TikTok viral</p>
          <Field label="Link del video de TikTok" hint="Pegá la URL del video viral del producto">
            <input className={inputCls} style={inputStyle} value={campos.tiktokVideoUrl} onChange={set("tiktokVideoUrl")} placeholder="https://www.tiktok.com/@.../video/..." />
          </Field>
          <Field label="Vistas en TikTok" hint="Cantidad aproximada de vistas">
            <input className={inputCls} style={inputStyle} type="number" value={campos.tiktokVistas} onChange={set("tiktokVistas")} placeholder="Ej: 1500000" />
          </Field>
        </div>

        {/* Proveedor */}
        <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(16,185,129,0.06)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--green)" }}>📦 Proveedor</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre del proveedor">
              <input className={inputCls} style={inputStyle} value={campos.proveedorNombre} onChange={set("proveedorNombre")} placeholder="Ej: AliExpress / CJ" />
            </Field>
            <Field label="Link del proveedor">
              <input className={inputCls} style={inputStyle} value={campos.proveedorUrl} onChange={set("proveedorUrl")} placeholder="https://..." />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Costo del proveedor (USD)">
              <input className={inputCls} style={inputStyle} type="number" step="0.01" value={campos.precioProveedor} onChange={set("precioProveedor")} placeholder="Ej: 3.50" />
            </Field>
            <Field label="Precio de venta (USD)">
              <input className={inputCls} style={inputStyle} type="number" step="0.01" value={campos.precioVenta} onChange={set("precioVenta")} placeholder="Ej: 24.99" />
            </Field>
          </div>
        </div>

        <Field label="Anuncios activos en Meta" hint="Si lo sabés, cuántos anuncios tiene en la biblioteca de Meta">
          <input className={inputCls} style={inputStyle} type="number" value={campos.metaAnunciosCount} onChange={set("metaAnunciosCount")} placeholder="Ej: 12" />
        </Field>

        {error && (
          <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(244,63,94,0.12)", color: "var(--red)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {enviando ? "Guardando..." : "Publicar producto"}
        </button>
      </form>
    </div>
  );
}
