import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Última fecha con datos
  const ultima = await prisma.tendenciaTikTok.findFirst({
    orderBy: { fecha: "desc" },
    select: { fecha: true },
  });

  if (!ultima) return NextResponse.json([]);

  const tendencias = await prisma.tendenciaTikTok.findMany({
    where: { fecha: ultima.fecha },
    orderBy: { vistas: "desc" },
    take: 50,
  });

  return NextResponse.json(tendencias);
}
