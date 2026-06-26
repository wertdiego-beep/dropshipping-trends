import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Normaliza el hashtag: sin #, sin espacios, minúsculas
function normalizar(raw: string): string {
  return raw.replace(/^#/, "").replace(/\s+/g, "").toLowerCase().slice(0, 60);
}

export async function GET() {
  const seguidos = await prisma.hashtagSeguido.findMany({
    orderBy: { creadoEn: "desc" },
  });

  // Cruzar con las tendencias del último scraping para mostrar vistas si existen
  const ultima = await prisma.tendenciaTikTok.findFirst({ orderBy: { fecha: "desc" }, select: { fecha: true } });
  const tendencias = ultima
    ? await prisma.tendenciaTikTok.findMany({ where: { fecha: ultima.fecha } })
    : [];
  const mapa = new Map(tendencias.map(t => [t.hashtag.replace(/^#/, "").toLowerCase(), t]));

  const conMetricas = seguidos.map(s => {
    const t = mapa.get(s.hashtag.toLowerCase());
    return { ...s, vistas: t?.vistas ?? null, posts: t?.posts ?? null, enTrending: !!t };
  });

  return NextResponse.json(conMetricas);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const hashtag = normalizar(String(body.hashtag ?? ""));
  if (hashtag.length < 2) {
    return NextResponse.json({ error: "Hashtag inválido" }, { status: 400 });
  }
  const creado = await prisma.hashtagSeguido.upsert({
    where: { hashtag },
    update: {},
    create: { hashtag },
  });
  return NextResponse.json(creado, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  await prisma.hashtagSeguido.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
