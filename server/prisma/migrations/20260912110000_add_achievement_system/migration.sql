-- AlterEnum
ALTER TYPE "AchievementType" ADD VALUE 'CHALLENGE';

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "rewardTitle" TEXT;
