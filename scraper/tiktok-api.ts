// Integración con una API de TikTok vía RapidAPI para traer videos por hashtag.
// Requiere RAPIDAPI_KEY y RAPIDAPI_HOST en las variables de entorno.
// El formato de respuesta se normaliza acá; si tu API devuelve otra estructura,
// se ajusta el mapeo en `normalizarVideo`.

export interface VideoHashtag {
  id: string;
  descripcion: string;
  url: string;
  thumbnail: string;
  vistas: number;
  likes: number;
  autor: string;
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Normaliza un item de video desde distintos formatos comunes de RapidAPI
function normalizarVideo(item: Record<string, unknown>): VideoHashtag | null {
  const id = String(item.id ?? item.aweme_id ?? item.video_id ?? "");
  const desc = String(item.title ?? item.desc ?? item.description ?? "");
  if (!id && !desc) return null;

  const author = item.author as Record<string, unknown> | undefined;
  const stats = (item.stats ?? item.statistics) as Record<string, unknown> | undefined;
  const video = item.video as Record<string, unknown> | undefined;

  const autorNombre = String(
    author?.unique_id ?? author?.uniqueId ?? author?.nickname ?? item.author_name ?? ""
  );

  return {
    id,
    descripcion: desc.slice(0, 200),
    url: id
      ? `https://www.tiktok.com/@${autorNombre || "user"}/video/${id}`
      : "",
    thumbnail: String(
      item.cover ?? video?.cover ?? video?.origin_cover ?? item.thumbnail ?? ""
    ),
    vistas: num(stats?.play_count ?? stats?.playCount ?? item.play_count),
    likes: num(stats?.digg_count ?? stats?.diggCount ?? item.digg_count),
    autor: autorNombre,
  };
}

export async function buscarVideosPorHashtag(
  hashtag: string,
  cantidad = 12
): Promise<VideoHashtag[]> {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST;
  if (!key || !host) {
    console.error("[TikTok API] Faltan RAPIDAPI_KEY / RAPIDAPI_HOST");
    return [];
  }

  const limpio = hashtag.replace(/^#/, "");
  // Endpoint típico de challenge/hashtag feed (se ajusta según la API elegida)
  const url = `https://${host}/challenge/posts?challenge_name=${encodeURIComponent(limpio)}&count=${cantidad}`;

  try {
    const res = await fetch(url, {
      headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": host },
    });
    if (!res.ok) {
      console.error(`[TikTok API] ${res.status} para #${limpio}`);
      return [];
    }
    const json = await res.json();
    // Las APIs devuelven la lista en distintas claves
    const items: Record<string, unknown>[] =
      json?.data?.videos ?? json?.data?.aweme_list ?? json?.videos ?? json?.aweme_list ?? json?.data ?? [];
    return items.map(normalizarVideo).filter((v): v is VideoHashtag => v !== null).slice(0, cantidad);
  } catch (e) {
    console.error("[TikTok API] error:", (e as Error).message);
    return [];
  }
}
