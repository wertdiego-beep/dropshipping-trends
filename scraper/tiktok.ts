import { chromium, type Browser, type Page } from "playwright";

export interface TikTokProduct {
  nombre: string;
  tiktokVideoUrl: string;
  tiktokVideoId: string;
  tiktokVistas: number;
  imagen: string;
  categoria: string;
}

const CREATIVE_CENTER_HASHTAGS =
  "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en";

function parseNum(text: string): number {
  const num = parseFloat(text.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return 0;
  if (/B/i.test(text)) return Math.round(num * 1_000_000_000);
  if (/M/i.test(text)) return Math.round(num * 1_000_000);
  if (/K/i.test(text)) return Math.round(num * 1_000);
  return Math.round(num);
}

async function extractTrends(page: Page): Promise<TikTokProduct[]> {
  const rows = await page.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll('[class*="cursor-pointer"][class*="border-b"]')
    ).filter(el => {
      const t = el.textContent ?? "";
      return t.includes("#") && /Posts/.test(t) && /Views/.test(t);
    });

    return cards.map(el => {
      // Los spans contienen: [categoría, posts, "Posts", views, "Views"]
      const spans = Array.from(el.querySelectorAll("span")).map(s => s.textContent?.trim() ?? "");
      const fullText = el.textContent?.trim() ?? "";
      const categoria = spans[0] ?? "";
      const posts = spans[1] ?? "0";
      const views = spans[3] ?? "0";

      // El hashtag es el texto entre el rank (número inicial) y la categoría
      let hashtag = "";
      if (categoria) {
        hashtag = fullText.split(categoria)[0].replace(/^\d+/, "").trim();
      }

      return { hashtag, categoria, posts, views };
    });
  });

  const productos: TikTokProduct[] = [];
  const vistos = new Set<string>();

  for (const r of rows) {
    if (!r.hashtag) continue;
    const limpio = r.hashtag.replace(/^#/, "").trim();
    const slug = limpio.toLowerCase().replace(/\s+/g, "");
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);

    productos.push({
      nombre: `#${limpio}`,
      tiktokVideoUrl: `https://www.tiktok.com/tag/${slug}`,
      tiktokVideoId: "",
      tiktokVistas: parseNum(r.views),
      imagen: "",
      categoria: r.categoria || "Trending",
    });
  }

  return productos;
}

export async function scrapeTikTokTrending(maxProducts = 20): Promise<TikTokProduct[]> {
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
    console.log("[TikTok] Abriendo Creative Center...");
    await page.goto(CREATIVE_CENTER_HASHTAGS, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(9000);

    // Click en "View More" repetidamente para cargar más tendencias
    for (let i = 0; i < 6; i++) {
      try {
        const btn = page.getByText(/view more/i).first();
        await btn.scrollIntoViewIfNeeded({ timeout: 2000 });
        await btn.click({ timeout: 2000 });
        await page.waitForTimeout(2500);
      } catch { break; }
    }

    const productos = await extractTrends(page);
    console.log(`[TikTok] ✓ ${productos.length} tendencias extraídas`);

    await browser.close();
    return productos.slice(0, maxProducts);
  } catch (error) {
    await browser?.close();
    console.error("[TikTok scraper]", error);
    return [];
  }
}
