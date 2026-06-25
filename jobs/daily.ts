import "dotenv/config";
import cron from "node-cron";
import { scrapeAmazonBestSellers, type AmazonProduct } from "../scraper/amazon";
import { contarAnunciosMeta } from "../scraper/meta";
import { buscarProveedorCJ } from "../scraper/cj-api";
import { prisma } from "../lib/prisma";

// ID estable por producto basado en su URL de Amazon (evita duplicados)
function idDe(p: AmazonProduct): string {
  const asin = p.url.match(/\/dp\/([A-Z0-9]+)/)?.[1];
  return asin ? `amazon_${asin}` : `amazon_${Buffer.from(p.nombre).toString("base64").slice(0, 24)}`;
}

async function procesar(p: AmazonProduct) {
  const id = idDe(p);

  // Meta ads + proveedor CJ en paralelo
  const [metaAds, cj] = await Promise.all([
    contarAnunciosMeta(p.nombre),
    buscarProveedorCJ(p.nombre),
  ]);

  const saved = await prisma.producto.upsert({
    where: { id },
    update: {
      tiktokVistas: p.reviews,
      precioVenta: p.precio || undefined,
      precioProveedor: cj?.precio ?? undefined,
      proveedorUrl: cj?.url ?? undefined,
      proveedorNombre: cj ? "CJ Dropshipping" : undefined,
      metaAnunciosCount: metaAds.count,
      imagen: p.imagen || undefined,
      actualizadoEn: new Date(),
    },
    create: {
      id,
      nombre: p.nombre,
      tiktokVideoUrl: p.url, // URL de Amazon (origen del producto)
      tiktokVideoId: null,
      tiktokVistas: p.reviews,
      imagen: p.imagen,
      categoria: p.categoria,
      precioVenta: p.precio || null,
      precioProveedor: cj?.precio ?? null,
      proveedorUrl: cj?.url ?? null,
      proveedorNombre: cj ? "CJ Dropshipping" : "CJ Dropshipping",
      metaAnunciosCount: metaAds.count,
    },
  });

  // Métrica del día (historial)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  await prisma.metricaDiaria.upsert({
    where: { productoId_fecha: { productoId: saved.id, fecha: hoy } },
    update: {
      tiktokVistas: p.reviews,
      googleTrends: Math.round(p.rating * 20), // rating 0-5 → 0-100
      metaAnuncios: metaAds.count,
      precioProveedor: p.precio || null,
    },
    create: {
      productoId: saved.id,
      fecha: hoy,
      tiktokVistas: p.reviews,
      googleTrends: Math.round(p.rating * 20),
      metaAnuncios: metaAds.count,
      precioProveedor: p.precio || null,
    },
  });

  const margen = p.precio && cj?.precio ? (p.precio - cj.precio).toFixed(2) : "n/a";
  console.log(`[daily] ✓ ${p.nombre.slice(0, 45)} | venta $${p.precio} | costo CJ $${cj?.precio ?? "n/a"} | margen $${margen} | ${metaAds.count} ads`);
}

export async function runDailyJob() {
  console.log(`[daily] Iniciando ${new Date().toISOString()}`);

  const productos = await scrapeAmazonBestSellers(5);
  console.log(`[daily] ${productos.length} productos de Amazon Best Sellers`);

  // Procesar de a 3 en paralelo
  for (let i = 0; i < productos.length; i += 3) {
    await Promise.allSettled(productos.slice(i, i + 3).map(procesar));
  }

  console.log(`[daily] Finalizado ${new Date().toISOString()}`);
}

// Cron: todos los días a las 6 AM
cron.schedule("0 6 * * *", () => {
  runDailyJob().catch(console.error);
});

if (require.main === module) {
  runDailyJob().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
