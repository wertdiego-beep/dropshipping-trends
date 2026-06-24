import { chromium, type Browser } from "playwright";

export interface ProveedorResult {
  nombre: string;
  precio: number;
  url: string;
  proveedor: string;
}

const ALIEXPRESS_SEARCH = "https://www.aliexpress.com/wholesale?SearchText=";

function parsePrice(text: string): number {
  const match = text.match(/[\d,.]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(",", "."));
}

export async function buscarProveedor(
  nombreProducto: string
): Promise<ProveedorResult | null> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      locale: "en-US",
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();
    const query = encodeURIComponent(nombreProducto);
    await page.goto(`${ALIEXPRESS_SEARCH}${query}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await page.waitForTimeout(2500);

    const result = await page.evaluate(() => {
      const selectors = [
        ".search-item-card-wrapper-gallery",
        "[class*='product-snippet']",
        "[class*='item-wrap']",
        ".list--gallery--C2f2tvm",
      ];

      let card: Element | null = null;
      for (const sel of selectors) {
        card = document.querySelector(sel);
        if (card) break;
      }
      if (!card) return null;

      const priceEl = card.querySelector(
        "[class*='price'],.price,.notranslate"
      );
      const titleEl = card.querySelector(
        "[class*='title'],[class*='description'],h1,h2,h3"
      );
      const linkEl = card.querySelector("a[href*='aliexpress']") ?? card.querySelector("a");

      const priceText = priceEl?.textContent?.trim() ?? "0";
      const title = titleEl?.textContent?.trim() ?? "";
      const href = linkEl?.getAttribute("href") ?? "";
      const url = href.startsWith("//") ? `https:${href}` : href;

      return { priceText, title, url };
    });

    await browser.close();

    if (!result || !result.url) return null;

    return {
      nombre: result.title || nombreProducto,
      precio: parsePrice(result.priceText),
      url: result.url,
      proveedor: "AliExpress",
    };
  } catch (error) {
    await browser?.close();
    console.error("[AliExpress scraper]", error);
    return null;
  }
}
