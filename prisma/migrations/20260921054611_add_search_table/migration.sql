-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchQuery_userId_term_idx" ON "SearchQuery"("userId", "term");

-- CreateIndex
CREATE INDEX "SearchQuery_term_idx" ON "SearchQuery"("term");

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
