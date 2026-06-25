-- CreateTable
CREATE TABLE "TendenciaTikTok" (
    "id" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "posts" INTEGER NOT NULL DEFAULT 0,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL DEFAULT 'Trending',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TendenciaTikTok_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TendenciaTikTok_fecha_idx" ON "TendenciaTikTok"("fecha");

-- CreateIndex
CREATE INDEX "TendenciaTikTok_vistas_idx" ON "TendenciaTikTok"("vistas");

-- CreateIndex
CREATE UNIQUE INDEX "TendenciaTikTok_hashtag_fecha_key" ON "TendenciaTikTok"("hashtag", "fecha");
