-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "meta" JSONB,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentlyViewedSymbol" (
    "symbol" TEXT NOT NULL,
    "views7d" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecentlyViewedSymbol_pkey" PRIMARY KEY ("symbol")
);

-- CreateIndex
CREATE INDEX "IngestionRun_job_startedAt_idx" ON "IngestionRun"("job", "startedAt");
