-- CreateTable
CREATE TABLE "CompletionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpAwarded" INTEGER NOT NULL,
    "goldAwarded" INTEGER NOT NULL,
    "streakAfter" INTEGER NOT NULL,
    "levelBefore" INTEGER NOT NULL,
    "levelAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompletionEvent_userId_completedAt_idx" ON "CompletionEvent"("userId", "completedAt");

-- AddForeignKey
ALTER TABLE "CompletionEvent" ADD CONSTRAINT "CompletionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletionEvent" ADD CONSTRAINT "CompletionEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
