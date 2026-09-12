-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'CHALLENGE_CLAIMED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'INTELLECT',
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "type" "QuestType" NOT NULL DEFAULT 'PROJECT';

-- CreateTable
CREATE TABLE "ChallengeClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengeClaim_userId_idx" ON "ChallengeClaim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeClaim_userId_type_periodKey_key" ON "ChallengeClaim"("userId", "type", "periodKey");

-- AddForeignKey
ALTER TABLE "ChallengeClaim" ADD CONSTRAINT "ChallengeClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
