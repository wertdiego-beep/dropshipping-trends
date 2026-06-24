import { chromium, type Browser } from "playwright";

export interface MetaAdsResult {
  count: number;
}

const META_ADS_LIBRARY =
  "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=";

export async function contarAnunciosMeta(
  nombreProducto: string
): Promise<MetaAdsResult> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      locale: "en-US",
      viewport: { width: 1280, height: 900 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();
    const query = encodeURIComponent(nombreProducto);
    await page.goto(`${META_ADS_LIBRARY}${query}`, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    });

    await page.waitForTimeout(4000);

    // Cerrar cookie banner si aparece
    try {
      await page.click('[data-testid="cookie-policy-manage-dialog-accept-button"]', {
        timeout: 3000,
      });
    } catch {}

    await page.waitForTimeout(2000);

    const count = await page.evaluate(() => {
      // Buscar el contador de resultados que muestra Meta
      const resultTextSelectors = [
        '[class*="result"] span',
        '[class*="count"]',
        'div[role="main"] span',
      ];

      for (const sel of resultTextSelectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const text = el.textContent ?? "";
          const match = text.match(/([\d,]+)\s*(result|ad|anunci)/i);
          if (match) {
            return parseInt(match[1].replace(/,/g, ""), 10);
          }
        }
      }

      // Fallback: contar cards de anuncios visibles
      const adCards = document.querySelectorAll(
        '[class*="ad-card"], [class*="AdCard"], [data-testid*="ad"]'
      );
      return adCards.length;
    });

    await browser.close();
    return { count };
  } catch (error) {
    await browser?.close();
    console.error("[Meta scraper]", error);
    return { count: 0 };
  }
}
