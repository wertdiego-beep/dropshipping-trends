-- CreateTable
CREATE TABLE "HashtagSeguido" (
    "id" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HashtagSeguido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HashtagSeguido_hashtag_key" ON "HashtagSeguido"("hashtag");

-- CreateIndex
CREATE INDEX "HashtagSeguido_creadoEn_idx" ON "HashtagSeguido"("creadoEn");
