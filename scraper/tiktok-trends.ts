// Tendencias de TikTok desde el endpoint loader del Creative Center.
// No necesita browser ni firma: fetch directo al SSR loader (rápido y confiable).

export interface TendenciaTikTok {
  hashtag: string;
  posts: number;
  vistas: number;
  categoria: string;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const REFERER =
  "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en";

// industryIDs → nombre legible (categorías del Creative Center)
const INDUSTRIAS: Record<string, string> = {
  "10000000000": "Ropa y Accesorios",
  "12000000000": "Belleza y Cuidado",
  "13000000000": "Salud",
  "17000000000": "Hogar",
  "18000000000": "Mascotas",
  "19000000000": "Deportes y Aire Libre",
  "21000000000": "Tecnología",
  "22000000000": "Comida y Bebida",
  "23000000000": "Noticias y Entretenimiento",
};

interface HashtagRaw {
  hashtagName: string;
  publishCnt?: number | string;
  vv?: number | string;
  industryIDs?: string[];
}

async function fetchPeriodo(period: number): Promise<HashtagRaw[]> {
  const url = `https://ads.tiktok.com/creative/creativeCenter/trends/hashtag?__loader=creativeCenter%2Ftrends%2F%28tab%29%2Fpage&__ssrDirect=true&period=${period}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Referer: REFERER } });
    const json = await res.json();
    const q = json?.dehydratedState?.queries?.find(
      (x: { queryKey?: unknown[] }) => Array.isArray(x.queryKey) && x.queryKey[0] === "popular"
    );
    return q?.state?.data?.pages?.[0]?.data ?? [];
  } catch (e) {
    console.error(`[TikTok Trends] period ${period} falló:`, (e as Error).message);
    return [];
  }
}

export async function scrapeTendenciasTikTok(max = 30): Promise<TendenciaTikTok[]> {
  // Combinar varios períodos para juntar más hashtags únicos
  const periodos = [7, 30];
  const todos: HashtagRaw[] = [];
  for (const p of periodos) {
    todos.push(...(await fetchPeriodo(p)));
  }

  const vistos = new Set<string>();
  const tendencias: TendenciaTikTok[] = [];
  for (const h of todos) {
    if (!h.hashtagName) continue;
    const slug = h.hashtagName.toLowerCase();
    if (vistos.has(slug)) continue;
    vistos.add(slug);
    const industriaId = h.industryIDs?.[0] ?? "";
    tendencias.push({
      hashtag: `#${h.hashtagName}`,
      posts: Math.round(Number(h.publishCnt ?? 0)),
      vistas: Number(h.vv ?? 0),
      categoria: INDUSTRIAS[industriaId] ?? "Trending",
    });
  }

  // Ordenar por vistas
  tendencias.sort((a, b) => b.vistas - a.vistas);
  console.log(`[TikTok Trends] ✓ ${tendencias.length} tendencias`);
  return tendencias.slice(0, max);
}
