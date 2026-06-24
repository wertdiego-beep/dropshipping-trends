export interface MetricaDiaria {
  id: string;
  productoId: string;
  fecha: string;
  tiktokVistas: number;
  googleTrends: number;
  metaAnuncios: number;
  precioProveedor: number | null;
}

export interface Producto {
  id: string;
  nombre: string;
  tiktokVideoUrl: string | null;
  tiktokVideoId: string | null;
  tiktokVistas: number;
  precioProveedor: number | null;
  proveedorUrl: string | null;
  proveedorNombre: string;
  metaAnunciosCount: number;
  imagen: string | null;
  categoria: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  metricas: MetricaDiaria[];
}
