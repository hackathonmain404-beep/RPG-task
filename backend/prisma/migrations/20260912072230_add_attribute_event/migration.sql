-- CreateTable
CREATE TABLE "AttributeEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attributeKey" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttributeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttributeEvent_userId_createdAt_idx" ON "AttributeEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AttributeEvent" ADD CONSTRAINT "AttributeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
