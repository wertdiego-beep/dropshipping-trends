import "dotenv/config";
import cron from "node-cron";
import { scrapeTikTokTrending } from "../scraper/tiktok";
import { buscarProveedor } from "../scraper/aliexpress";
import { contarAnunciosMeta } from "../scraper/meta";
import { prisma } from "../lib/prisma";

async function procesarProducto(producto: Awaited<ReturnType<typeof scrapeTikTokTrending>>[number]) {
  // Buscar proveedor y anuncios en paralelo
  const [proveedor, metaAds] = await Promise.all([
    buscarProveedor(producto.nombre),
    contarAnunciosMeta(producto.nombre),
  ]);

  // Upsert del producto (evitar duplicados por videoId)
  const saved = await prisma.producto.upsert({
    where: {
      // Usamos el videoId como identificador único si existe
      id: producto.tiktokVideoId
        ? `tiktok_${producto.tiktokVideoId}`
        : `nombre_${Buffer.from(producto.nombre).toString("base64").slice(0, 20)}`,
    },
    update: {
      tiktokVistas: producto.tiktokVistas,
      precioProveedor: proveedor?.precio ?? undefined,
      proveedorUrl: proveedor?.url ?? undefined,
      metaAnunciosCount: metaAds.count,
      actualizadoEn: new Date(),
    },
    create: {
      id: producto.tiktokVideoId
        ? `tiktok_${producto.tiktokVideoId}`
        : undefined,
      nombre: producto.nombre,
      tiktokVideoUrl: producto.tiktokVideoUrl,
      tiktokVideoId: producto.tiktokVideoId,
      tiktokVistas: producto.tiktokVistas,
      imagen: producto.imagen,
      categoria: producto.categoria,
      precioProveedor: proveedor?.precio ?? null,
      proveedorUrl: proveedor?.url ?? null,
      proveedorNombre: proveedor?.proveedor ?? "AliExpress",
      metaAnunciosCount: metaAds.count,
    },
  });

  // Guardar métrica del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  await prisma.metricaDiaria.upsert({
    where: {
      productoId_fecha: {
        productoId: saved.id,
        fecha: hoy,
      },
    },
    update: {
      tiktokVistas: producto.tiktokVistas,
      metaAnuncios: metaAds.count,
      precioProveedor: proveedor?.precio ?? null,
    },
    create: {
      productoId: saved.id,
      fecha: hoy,
      tiktokVistas: producto.tiktokVistas,
      metaAnuncios: metaAds.count,
      precioProveedor: proveedor?.precio ?? null,
    },
  });

  console.log(`[daily] ✓ ${producto.nombre} | vistas: ${producto.tiktokVistas} | precio: ${proveedor?.precio ?? "n/a"} | meta ads: ${metaAds.count}`);
}

export async function runDailyJob() {
  console.log(`[daily] Iniciando scraping ${new Date().toISOString()}`);

  const productos = await scrapeTikTokTrending(20);
  console.log(`[daily] Encontrados ${productos.length} productos en TikTok`);

  // Procesar de a 3 en paralelo para no saturar
  for (let i = 0; i < productos.length; i += 3) {
    const batch = productos.slice(i, i + 3);
    await Promise.allSettled(batch.map(procesarProducto));
  }

  console.log(`[daily] Finalizado ${new Date().toISOString()}`);
}

// Correr todos los días a las 6 AM
cron.schedule("0 6 * * *", () => {
  runDailyJob().catch(console.error);
});

// Ejecutar inmediatamente si se llama directo
if (require.main === module) {
  runDailyJob()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
