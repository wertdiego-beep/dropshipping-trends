// Genera links de búsqueda directa del producto en proveedores de dropshipping.
// No scrapeamos (AliExpress/CJ bloquean con captcha): llevamos al usuario directo
// a los resultados de búsqueda con 1 click.

// Limpia el nombre de Amazon para una búsqueda más efectiva en el proveedor:
// quita marcas largas, tamaños y ruido, deja las primeras palabras clave.
export function keywordsDeBusqueda(nombre: string): string {
  return nombre
    .replace(/\|.*$/, "")               // corta todo después del primer "|"
    .replace(/[\(\)\[\]]/g, " ")        // quita paréntesis/corchetes
    .replace(/\b\d+(\.\d+)?\s?(oz|ml|lb|kg|g|pack|count|ct|pcs|piece|inch|in|cm)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 6)                        // primeras 6 palabras clave
    .join(" ");
}

export function linkAliExpress(nombre: string): string {
  const q = encodeURIComponent(keywordsDeBusqueda(nombre));
  return `https://www.aliexpress.com/wholesale?SearchText=${q}`;
}

export function linkCJ(nombre: string): string {
  const q = encodeURIComponent(keywordsDeBusqueda(nombre));
  return `https://cjdropshipping.com/search/${q}.html`;
}

export interface Margen {
  ganancia: number;   // venta - costo
  porcentaje: number; // markup sobre el costo
}

// Calcula el margen entre el precio de venta (Amazon) y el costo del proveedor (CJ)
export function calcularMargen(precioVenta: number | null, precioCosto: number | null): Margen | null {
  if (!precioVenta || !precioCosto || precioCosto <= 0) return null;
  const ganancia = precioVenta - precioCosto;
  const porcentaje = (ganancia / precioCosto) * 100;
  return { ganancia, porcentaje };
}

// Score de oportunidad (0–100): combina margen, demanda (anuncios Meta) y
// popularidad (reviews). Un producto "caliente" tiene buen margen + se está
// anunciando activamente + tiene tracción comprobada.
export function scoreOportunidad(p: {
  precioVenta: number | null;
  precioProveedor: number | null;
  metaAnunciosCount: number;
  tiktokVistas: number;
}): number {
  const margen = calcularMargen(p.precioVenta, p.precioProveedor);
  // Margen: hasta 50 pts (satura en 500% de markup)
  const ptsMargen = margen ? Math.min(margen.porcentaje / 500, 1) * 50 : 0;
  // Demanda Meta: hasta 35 pts (satura en 10 anuncios)
  const ptsAds = Math.min(p.metaAnunciosCount / 10, 1) * 35;
  // Popularidad reviews: hasta 15 pts (satura en 100k reviews)
  const ptsReviews = Math.min(p.tiktokVistas / 100_000, 1) * 15;
  return Math.round(ptsMargen + ptsAds + ptsReviews);
}
