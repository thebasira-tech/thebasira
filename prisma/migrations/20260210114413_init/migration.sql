-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('EQUITY', 'ETF', 'DEBT');

-- CreateTable
CREATE TABLE "Security" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "sector" TEXT,
    "csiStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPrice" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "close" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "value" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "high52w" DOUBLE PRECISION,
    "low52w" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OhlcvBar" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OhlcvBar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexValue" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "changePct" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndexValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Security_symbol_key" ON "Security"("symbol");

-- CreateIndex
CREATE INDEX "DailyPrice_date_idx" ON "DailyPrice"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPrice_symbol_date_key" ON "DailyPrice"("symbol", "date");

-- CreateIndex
CREATE INDEX "OhlcvBar_symbol_date_idx" ON "OhlcvBar"("symbol", "date");

-- CreateIndex
CREATE INDEX "OhlcvBar_date_idx" ON "OhlcvBar"("date");

-- CreateIndex
CREATE UNIQUE INDEX "OhlcvBar_symbol_date_key" ON "OhlcvBar"("symbol", "date");

-- CreateIndex
CREATE INDEX "IndexValue_date_idx" ON "IndexValue"("date");

-- CreateIndex
CREATE UNIQUE INDEX "IndexValue_symbol_date_key" ON "IndexValue"("symbol", "date");

-- AddForeignKey
ALTER TABLE "DailyPrice" ADD CONSTRAINT "DailyPrice_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "Security"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OhlcvBar" ADD CONSTRAINT "OhlcvBar_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "Security"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;
