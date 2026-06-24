import { chromium, type Browser, type Page } from "playwright";

export interface TikTokProduct {
  nombre: string;
  tiktokVideoUrl: string;
  tiktokVideoId: string;
  tiktokVistas: number;
  imagen: string;
  categoria: string;
}

const TIKTOK_SHOP_URL = "https://www.tiktok.com/shop/trending";

async function dismissPopups(page: Page) {
  try {
    await page.click('[data-e2e="close-button"]', { timeout: 3000 });
  } catch {}
  try {
    await page.click('button:has-text("Decline")', { timeout: 2000 });
  } catch {}
  try {
    await page.click('button:has-text("Not now")', { timeout: 2000 });
  } catch {}
}

async function extractProductsFromPage(page: Page): Promise<TikTokProduct[]> {
  return page.evaluate(() => {
    const cards = document.querySelectorAll(
      '[data-e2e="product-card"], .product-card, [class*="ProductCard"], [class*="product-item"]'
    );

    const results: TikTokProduct[] = [];

    cards.forEach((card) => {
      const titleEl =
        card.querySelector('[class*="title"], [class*="name"], h3, h4') ||
        card.querySelector("p");
      const imgEl = card.querySelector("img");
      const linkEl = card.querySelector("a[href*='/video/'], a[href*='tiktok']");
      const viewsEl = card.querySelector(
        '[class*="views"], [class*="play"], [data-e2e*="play-count"]'
      );

      const nombre = titleEl?.textContent?.trim() ?? "";
      const imagen = imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? "";
      const href = linkEl?.getAttribute("href") ?? "";
      const videoIdMatch = href.match(/video\/(\d+)/);
      const tiktokVideoId = videoIdMatch?.[1] ?? "";
      const tiktokVideoUrl = tiktokVideoId
        ? `https://www.tiktok.com/video/${tiktokVideoId}`
        : href;

      const viewsText = viewsEl?.textContent?.trim() ?? "0";
      const tiktokVistas = parseViews(viewsText);

      if (nombre) {
        results.push({
          nombre,
          tiktokVideoUrl,
          tiktokVideoId,
          tiktokVistas,
          imagen,
          categoria: "",
        });
      }
    });

    return results;

    function parseViews(text: string): number {
      const num = parseFloat(text.replace(/[^0-9.]/g, ""));
      if (text.includes("M")) return Math.round(num * 1_000_000);
      if (text.includes("K")) return Math.round(num * 1_000);
      return isNaN(num) ? 0 : Math.round(num);
    }
  });
}

async function scrapeWithFallback(page: Page): Promise<TikTokProduct[]> {
  // Interceptar respuestas de API de TikTok para extraer datos estructurados
  const apiProducts: TikTokProduct[] = [];

  page.on("response", async (response) => {
    const url = response.url();
    if (
      url.includes("api/recommend") ||
      url.includes("api/product") ||
      url.includes("trending")
    ) {
      try {
        const json = await response.json();
        const items = json?.data?.products ?? json?.data?.items ?? json?.products ?? [];
        items.forEach((item: Record<string, unknown>) => {
          const nombre =
            (item.title as string) ?? (item.name as string) ?? (item.product_name as string) ?? "";
          if (!nombre) return;
          const videoInfo = (item.video as Record<string, unknown>) ?? {};
          const tiktokVideoId = String(videoInfo.id ?? item.video_id ?? "");
          apiProducts.push({
            nombre,
            tiktokVideoUrl: tiktokVideoId
              ? `https://www.tiktok.com/video/${tiktokVideoId}`
              : "",
            tiktokVideoId,
            tiktokVistas: Number(videoInfo.play_count ?? item.play_count ?? 0),
            imagen: String(
              ((item.cover as Record<string, unknown[]> | null)?.url_list?.[0]) ??
                item.cover ??
                item.image ??
                ""
            ),
            categoria: String(item.category ?? ""),
          });
        });
      } catch {}
    }
  });

  await page.goto(TIKTOK_SHOP_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await dismissPopups(page);

  // Scroll para cargar más productos
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1500);
  }

  // Si la API interceptó datos, usarlos; si no, parsear el DOM
  if (apiProducts.length > 0) return apiProducts;
  return extractProductsFromPage(page);
}

export async function scrapeTikTokTrending(
  maxProducts = 20
): Promise<TikTokProduct[]> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
    });

    const context = await browser.newContext({
      locale: "en-US",
      timezoneId: "America/New_York",
      viewport: { width: 1280, height: 800 },
    });

    // Inyectar cookie de sesión si está disponible
    if (process.env.TIKTOK_COOKIE) {
      const cookies = process.env.TIKTOK_COOKIE.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return { name: name.trim(), value: rest.join("=").trim(), domain: ".tiktok.com", path: "/" };
      });
      await context.addCookies(cookies);
    }

    const page = await context.newPage();
    const products = await scrapeWithFallback(page);
    await browser.close();

    return products.slice(0, maxProducts);
  } catch (error) {
    await browser?.close();
    console.error("[TikTok scraper]", error);
    return [];
  }
}
