import { NextResponse } from "next/server";
import { runDailyJob } from "@/jobs/daily";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SCRAPING_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Correr en background sin bloquear la respuesta
  runDailyJob().catch(console.error);

  return NextResponse.json({ ok: true, mensaje: "Scraping iniciado" });
}
