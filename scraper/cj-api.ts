// Integración con la API oficial de CJ Dropshipping (gratis).
// Docs: https://developers.cjdropshipping.com/
// Requiere CJ_EMAIL y CJ_API_KEY en las variables de entorno.

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export interface CJProveedor {
  precio: number;        // costo en USD
  url: string;           // link al producto en CJ
  nombre: string;
  imagen: string;
}

// Cache del access token en memoria (CJ lo da con validez de ~15 días)
let tokenCache: { token: string; expira: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const email = process.env.CJ_EMAIL;
  const apiKey = process.env.CJ_API_KEY;
  if (!email || !apiKey) return null;

  if (tokenCache && tokenCache.expira > Date.now()) return tokenCache.token;

  try {
    const res = await fetch(`${BASE}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, apiKey }),
    });
    const json = await res.json();
    const token = json?.data?.accessToken as string | undefined;
    if (!token) {
      console.error("[CJ] No se obtuvo token:", json?.message ?? json);
      return null;
    }
    // Guardar token con 14 días de validez (margen de seguridad)
    tokenCache = { token, expira: Date.now() + 14 * 24 * 60 * 60 * 1000 };
    return token;
  } catch (e) {
    console.error("[CJ] Error al autenticar:", e);
    return null;
  }
}

function parsePrecio(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    // CJ a veces devuelve rangos "1.50 -- 3.20" — tomamos el menor
    const m = raw.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
}

// Busca un producto en CJ por nombre y devuelve el proveedor más barato
export async function buscarProveedorCJ(nombre: string): Promise<CJProveedor | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const params = new URLSearchParams({
      pageNum: "1",
      pageSize: "5",
      productNameEn: nombre.split(" ").slice(0, 5).join(" "),
    });
    const res = await fetch(`${BASE}/product/list?${params}`, {
      headers: { "CJ-Access-Token": token },
    });
    const json = await res.json();
    const lista = json?.data?.list as Array<Record<string, unknown>> | undefined;
    if (!lista || lista.length === 0) return null;

    // Tomar el producto más barato
    const items = lista
      .map(item => ({
        precio: parsePrecio(item.sellPrice),
        url: `https://cjdropshipping.com/product/-p-${item.pid ?? ""}.html`,
        nombre: String(item.productNameEn ?? nombre),
        imagen: String(item.productImage ?? ""),
      }))
      .filter(p => p.precio > 0)
      .sort((a, b) => a.precio - b.precio);

    return items[0] ?? null;
  } catch (e) {
    console.error("[CJ] Error en búsqueda:", e);
    return null;
  }
}
