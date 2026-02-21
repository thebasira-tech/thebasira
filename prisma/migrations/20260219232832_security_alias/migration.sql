-- CreateTable
CREATE TABLE "SecurityAlias" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "SecurityAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityAlias_alias_idx" ON "SecurityAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityAlias_symbol_alias_key" ON "SecurityAlias"("symbol", "alias");

-- AddForeignKey
ALTER TABLE "SecurityAlias" ADD CONSTRAINT "SecurityAlias_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "Security"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;
