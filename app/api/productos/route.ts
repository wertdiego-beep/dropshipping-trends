import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
