import { chromium, type Browser, type Page } from "playwright";

export interface AmazonProduct {
  nombre: string;
  imagen: string;
  precio: number;
  url: string;
  ranking: number;
  reviews: number;
  rating: number;
  categoria: string;
}

// Categorías de Best Sellers relevantes para dropshipping
const CATEGORIAS = [
  { nombre: "Hogar", url: "https://www.amazon.com/Best-Sellers-Home-Kitchen/zgbs/home-garden" },
  { nombre: "Belleza", url: "https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty" },
  { nombre: "Electrónica", url: "https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics" },
  { nombre: "Deportes", url: "https://www.amazon.com/Best-Sellers-Sports-Outdoors/zgbs/sporting-goods" },
  { nombre: "Mascotas", url: "https://www.amazon.com/Best-Sellers-Pet-Supplies/zgbs/pet-supplies" },
];

function parsePrecio(text: string): number {
  const m = text.replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function parseNum(text: string): number {
  const clean = text.replace(/[^0-9.KMkm]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (/k/i.test(text)) return Math.round(num * 1000);
  return Math.round(num);
}

async function scrapeCategoria(page: Page, cat: typeof CATEGORIAS[number], limite: number): Promise<AmazonProduct[]> {
  await page.goto(cat.url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2500);

  // Scroll para cargar todas las imágenes lazy
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(700);
  }

  const productos = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("#gridItemRoot, [id='gridItemRoot'], .zg-grid-general-faceout"));
    const results: Omit<AmazonProduct, "categoria">[] = [];
    const vistos = new Set<string>();

    items.forEach((item, idx) => {
      const link = item.querySelector("a.a-link-normal[href*='/dp/']") as HTMLAnchorElement | null;
      const img = item.querySelector("img") as HTMLImageElement | null;
      const ratingEl = item.querySelector(".a-icon-alt, [class*='rating']");
      const reviewsEl = item.querySelector("a[title*='ratings'], .a-size-small.a-link-normal, .a-link-normal .a-size-small");
      const titleEl = item.querySelector("._cDEzb_p13n-sc-css-line-clamp-3_g3dy1, [class*='line-clamp'], .p13n-sc-truncate");

      const nombre = (titleEl?.textContent ?? img?.getAttribute("alt") ?? "").trim();
      const imagen = img?.getAttribute("src") ?? "";
      const href = link?.getAttribute("href") ?? "";
      const url = (href.startsWith("http") ? href : `https://www.amazon.com${href}`).split("?")[0];

      // Precio: la clase del best-seller da el precio limpio "$20.18".
      // (.a-offscreen genérico a veces es el rating, no el precio)
      const priceEl = item.querySelector("._cDEzb_p13n-sc-price_3mJ9Z") ?? item.querySelector(".a-price .a-offscreen");
      const precioText = (priceEl?.textContent ?? "").replace(/,/g, "");
      const precioMatch = precioText.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
      const precio = precioMatch ? parseFloat(precioMatch[1]) : 0;

      const ratingText = ratingEl?.textContent ?? "0";
      const reviewsText = reviewsEl?.textContent ?? "0";

      // Deduplicar por URL (Amazon anida contenedores)
      const dedupeKey = url || nombre;
      if (nombre && nombre.length > 5 && !vistos.has(dedupeKey)) {
        vistos.add(dedupeKey);
        results.push({
          nombre: nombre.slice(0, 150),
          imagen,
          precio,
          url,
          ranking: idx + 1,
          reviews: parseFloat(reviewsText.replace(/[^0-9]/g, "")) || 0,
          rating: parseFloat(ratingText) || 0,
        });
      }
    });

    return results;
  });

  return productos.slice(0, limite).map(p => ({ ...p, categoria: cat.nombre }));
}

export async function scrapeAmazonBestSellers(porCategoria = 4): Promise<AmazonProduct[]> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US",
      viewport: { width: 1280, height: 900 },
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();
    const todos: AmazonProduct[] = [];

    for (const cat of CATEGORIAS) {
      try {
        console.log(`[Amazon] Scrapeando ${cat.nombre}...`);
        const productos = await scrapeCategoria(page, cat, porCategoria);
        console.log(`[Amazon] ✓ ${productos.length} de ${cat.nombre}`);
        todos.push(...productos);
      } catch (e) {
        console.log(`[Amazon] ✗ Falló ${cat.nombre}`);
      }
    }

    await browser.close();
    return todos;
  } catch (error) {
    await browser?.close();
    console.error("[Amazon scraper]", error);
    return [];
  }
}
