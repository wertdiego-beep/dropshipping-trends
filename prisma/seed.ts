import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const productos = [
    {
      nombre: "Magnetic Phone Holder Car Mount",
      tiktokVideoUrl: "https://www.tiktok.com/video/7321456789012345678",
      tiktokVideoId: "7321456789012345678",
      tiktokVistas: 4500000,
      imagen: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400",
      categoria: "Accesorios Auto",
      precioProveedor: 3.49,
      proveedorUrl: "https://www.aliexpress.com/item/123456789.html",
      proveedorNombre: "AliExpress",
      metaAnunciosCount: 342,
    },
    {
      nombre: "LED Strip Lights RGB Smart",
      tiktokVideoUrl: "https://www.tiktok.com/video/7321456789012345679",
      tiktokVideoId: "7321456789012345679",
      tiktokVistas: 8200000,
      imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      categoria: "Hogar",
      precioProveedor: 6.99,
      proveedorUrl: "https://www.aliexpress.com/item/987654321.html",
      proveedorNombre: "AliExpress",
      metaAnunciosCount: 891,
    },
    {
      nombre: "Portable Blender Mini USB",
      tiktokVideoUrl: "https://www.tiktok.com/video/7321456789012345680",
      tiktokVideoId: "7321456789012345680",
      tiktokVistas: 12700000,
      imagen: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400",
      categoria: "Cocina",
      precioProveedor: 8.25,
      proveedorUrl: "https://www.aliexpress.com/item/112233445.html",
      proveedorNombre: "AliExpress",
      metaAnunciosCount: 1205,
    },
    {
      nombre: "Posture Corrector Adjustable Back Brace",
      tiktokVideoUrl: "https://www.tiktok.com/video/7321456789012345681",
      tiktokVideoId: "7321456789012345681",
      tiktokVistas: 6100000,
      imagen: "https://images.unsplash.com/photo-1616279969965-948a26e95af0?w=400",
      categoria: "Salud",
      precioProveedor: 4.15,
      proveedorUrl: "https://www.aliexpress.com/item/556677889.html",
      proveedorNombre: "AliExpress",
      metaAnunciosCount: 567,
    },
    {
      nombre: "Waterproof Eyebrow Stamp Stencil Kit",
      tiktokVideoUrl: "https://www.tiktok.com/video/7321456789012345682",
      tiktokVideoId: "7321456789012345682",
      tiktokVistas: 19300000,
      imagen: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
      categoria: "Belleza",
      precioProveedor: 2.89,
      proveedorUrl: "https://www.aliexpress.com/item/667788990.html",
      proveedorNombre: "AliExpress",
      metaAnunciosCount: 2341,
    },
    {
      nombre: "Foldable Laptop Stand Adjustable Aluminum",
      tiktokVideoUrl: "https://www.tiktok.com/video/7321456789012345683",
      tiktokVideoId: "7321456789012345683",
      tiktokVistas: 3800000,
      imagen: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
      categoria: "Tech",
      precioProveedor: 11.50,
      proveedorUrl: "https://www.aliexpress.com/item/778899001.html",
      proveedorNombre: "AliExpress",
      metaAnunciosCount: 423,
    },
  ];

  for (const p of productos) {
    const producto = await prisma.producto.create({ data: p });

    for (let i = 13; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);

      const factor = 1 - i * 0.03;
      await prisma.metricaDiaria.create({
        data: {
          productoId: producto.id,
          fecha,
          tiktokVistas: Math.round(p.tiktokVistas * factor * (0.9 + Math.random() * 0.2)),
          googleTrends: Math.round(60 + Math.random() * 40),
          metaAnuncios: Math.round(p.metaAnunciosCount * factor),
          precioProveedor: p.precioProveedor,
        },
      });
    }
  }

  console.log("✅ Seed completado — 6 productos con 14 días de métricas");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
