-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tiktokVideoUrl" TEXT,
    "tiktokVideoId" TEXT,
    "tiktokVistas" INTEGER NOT NULL DEFAULT 0,
    "precioProveedor" DOUBLE PRECISION,
    "proveedorUrl" TEXT,
    "proveedorNombre" TEXT NOT NULL DEFAULT 'AliExpress',
    "metaAnunciosCount" INTEGER NOT NULL DEFAULT 0,
    "imagen" TEXT,
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricaDiaria" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tiktokVistas" INTEGER NOT NULL DEFAULT 0,
    "googleTrends" INTEGER NOT NULL DEFAULT 0,
    "metaAnuncios" INTEGER NOT NULL DEFAULT 0,
    "precioProveedor" DOUBLE PRECISION,

    CONSTRAINT "MetricaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Producto_creadoEn_idx" ON "Producto"("creadoEn");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- CreateIndex
CREATE INDEX "MetricaDiaria_productoId_idx" ON "MetricaDiaria"("productoId");

-- CreateIndex
CREATE INDEX "MetricaDiaria_fecha_idx" ON "MetricaDiaria"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "MetricaDiaria_productoId_fecha_key" ON "MetricaDiaria"("productoId", "fecha");

-- AddForeignKey
ALTER TABLE "MetricaDiaria" ADD CONSTRAINT "MetricaDiaria_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
