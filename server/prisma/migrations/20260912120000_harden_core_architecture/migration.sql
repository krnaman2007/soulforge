-- AlterTable User: Add timezone
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateIndex: Task completedAt and dueDate indexes
CREATE INDEX IF NOT EXISTS "Task_userId_completedAt_idx" ON "Task"("userId", "completedAt");
CREATE INDEX IF NOT EXISTS "Task_userId_dueDate_idx" ON "Task"("userId", "dueDate");
