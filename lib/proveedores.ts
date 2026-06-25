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
