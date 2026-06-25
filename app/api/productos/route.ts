import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Extrae el ID del video desde una URL de TikTok
function tiktokVideoId(url: string): string | null {
  return url.match(/\/video\/(\d+)/)?.[1] ?? null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const nombre = String(body.nombre ?? "").trim();
  if (nombre.length < 3) {
    return NextResponse.json({ error: "El nombre es obligatorio (mínimo 3 caracteres)" }, { status: 400 });
  }

  const tiktokVideoUrl = body.tiktokVideoUrl ? String(body.tiktokVideoUrl).trim() : null;
  const precioProveedor = body.precioProveedor ? Number(body.precioProveedor) : null;
  const precioVenta = body.precioVenta ? Number(body.precioVenta) : null;
  const metaAnunciosCount = body.metaAnunciosCount ? Math.max(0, Math.round(Number(body.metaAnunciosCount))) : 0;

  const producto = await prisma.producto.create({
    data: {
      nombre: nombre.slice(0, 200),
      tiktokVideoUrl,
      tiktokVideoId: tiktokVideoUrl ? tiktokVideoId(tiktokVideoUrl) : null,
      tiktokVistas: body.tiktokVistas ? Math.max(0, Math.round(Number(body.tiktokVistas))) : 0,
      imagen: body.imagen ? String(body.imagen).trim() : null,
      categoria: body.categoria ? String(body.categoria).trim().slice(0, 40) : "Comunidad",
      precioVenta: precioVenta && precioVenta > 0 ? precioVenta : null,
      precioProveedor: precioProveedor && precioProveedor > 0 ? precioProveedor : null,
      proveedorUrl: body.proveedorUrl ? String(body.proveedorUrl).trim() : null,
      proveedorNombre: body.proveedorNombre ? String(body.proveedorNombre).trim().slice(0, 40) : "Proveedor",
      metaAnunciosCount,
      creadoPorUsuario: true,
    },
  });

  // Métrica inicial del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  await prisma.metricaDiaria.create({
    data: {
      productoId: producto.id,
      fecha: hoy,
      tiktokVistas: producto.tiktokVistas,
      metaAnuncios: metaAnunciosCount,
      precioProveedor: producto.precioProveedor,
    },
  });

  return NextResponse.json(producto, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dias = parseInt(searchParams.get("dias") ?? "30");

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const productos = await prisma.producto.findMany({
    where: { activo: true, creadoEn: { gte: desde } },
    orderBy: { tiktokVistas: "desc" },
    take: 50,
    include: {
      metricas: {
        orderBy: { fecha: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(productos);
}
