import { chromium, type Browser, type Page } from "playwright";

export interface TendenciaTikTok {
  hashtag: string;
  posts: number;
  vistas: number;
  categoria: string;
}

const CREATIVE_CENTER =
  "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en";

function parseNum(text: string): number {
  const num = parseFloat(text.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return 0;
  if (/B/i.test(text)) return Math.round(num * 1_000_000_000);
  if (/M/i.test(text)) return Math.round(num * 1_000_000);
  if (/K/i.test(text)) return Math.round(num * 1_000);
  return Math.round(num);
}

async function extraer(page: Page): Promise<TendenciaTikTok[]> {
  const filas = await page.evaluate(() => {
    // Buscar las filas de hashtag: cualquier elemento chico con #, Posts y Views.
    // (más robusto que un selector CSS específico que cambia con cada rediseño)
    const cards = Array.from(document.querySelectorAll("div, li, tr")).filter(el => {
      const t = el.textContent ?? "";
      return t.includes("#") && /Posts/.test(t) && /Views/.test(t) &&
        t.length < 200 && el.querySelectorAll("span").length >= 3;
    });
    return cards.map(el => {
      const spans = Array.from(el.querySelectorAll("span")).map(s => s.textContent?.trim() ?? "");
      const fullText = el.textContent?.trim() ?? "";
      const categoria = spans.find(s => s && !/Posts|Views|^\d/.test(s) && s.length > 2) ?? "";
      const posts = spans.find(s => /^[\d.]+[KMB]?$/.test(s)) ?? "0";
      const views = spans.filter(s => /^[\d.]+[KMB]?$/.test(s))[1] ?? "0";
      let hashtag = "";
      if (categoria) hashtag = fullText.split(categoria)[0].replace(/^\d+/, "").trim();
      return { hashtag, categoria, posts, views };
    });
  });

  const resultado: TendenciaTikTok[] = [];
  const vistos = new Set<string>();
  for (const f of filas) {
    if (!f.hashtag) continue;
    const limpio = f.hashtag.replace(/^#/, "").trim();
    if (!limpio || vistos.has(limpio.toLowerCase())) continue;
    vistos.add(limpio.toLowerCase());
    resultado.push({
      hashtag: `#${limpio}`,
      posts: parseNum(f.posts),
      vistas: parseNum(f.views),
      categoria: f.categoria || "Trending",
    });
  }
  return resultado;
}

export async function scrapeTendenciasTikTok(max = 30): Promise<TendenciaTikTok[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
    });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US", viewport: { width: 1280, height: 900 },
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
    if (process.env.TIKTOK_COOKIE) {
      const cookies = process.env.TIKTOK_COOKIE.split(";").map(c => {
        const [name, ...rest] = c.trim().split("=");
        return { name: name.trim(), value: rest.join("=").trim(), domain: ".tiktok.com", path: "/" };
      });
      await context.addCookies(cookies);
    }
    const page = await context.newPage();

    // Reintentar hasta 2 veces (el Creative Center a veces carga vacío)
    let tendencias: TendenciaTikTok[] = [];
    for (let intento = 1; intento <= 2 && tendencias.length === 0; intento++) {
      console.log(`[TikTok Trends] Intento ${intento}...`);
      await page.goto(CREATIVE_CENTER, { waitUntil: "domcontentloaded", timeout: 45000 });
      // Esperar a que el contenido con hashtags esté presente (hasta 15s)
      for (let w = 0; w < 15; w++) {
        await page.waitForTimeout(1000);
        const listo = await page.evaluate(() =>
          /Posts/.test(document.body.innerText) && /Views/.test(document.body.innerText) && document.body.innerText.includes("#")
        );
        if (listo) break;
      }
      await page.waitForTimeout(2000);
      tendencias = await extraer(page);
    }
    console.log(`[TikTok Trends] ✓ ${tendencias.length} tendencias`);
    await browser.close();
    return tendencias.slice(0, max);
  } catch (error) {
    await browser?.close();
    console.error("[TikTok Trends]", error);
    return [];
  }
}
