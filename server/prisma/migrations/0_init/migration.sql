-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AchievementType" AS ENUM ('TASK', 'STREAK', 'LEVEL', 'PROJECT', 'ECONOMY');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('TASK_CREATED', 'TASK_COMPLETED', 'TASK_DELETED', 'PROJECT_CREATED', 'PROJECT_COMPLETED', 'XP_GAINED', 'LEVEL_UP', 'ITEM_PURCHASED', 'ITEM_EQUIPPED', 'STREAK_STARTED', 'STREAK_INCREASED', 'STREAK_BROKEN', 'STREAK_RECOVERED', 'ACHIEVEMENT_UNLOCKED');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('INTELLECT', 'STRENGTH', 'DISCIPLINE', 'HEALTH', 'CREATIVITY', 'SOCIAL', 'PHYSICAL', 'LEADERSHIP', 'FINANCE', 'CAREER', 'EMOTIONAL', 'LEARNING', 'PERSONAL_GROWTH');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EPIC');

-- CreateEnum
CREATE TYPE "public"."Effort" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."Impact" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."ItemRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "public"."ItemType" AS ENUM ('AVATAR', 'THEME', 'SKIN', 'WEAPON', 'PET', 'BACKGROUND', 'FRAME', 'TITLE', 'EFFECT');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."QuestType" AS ENUM ('ONE_TIME', 'DAILY', 'RECURRING', 'MILESTONE', 'HABIT', 'PROJECT', 'LEARNING', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "public"."SuspicionLevel" AS ENUM ('NORMAL', 'SUSPICIOUS', 'HIGH_RISK');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TimeScale" AS ENUM ('MINUTES', 'LESS_THAN_HOUR', 'HOURS', 'HALF_DAY', 'FULL_DAY', 'MULTI_DAY', 'MULTI_WEEK');

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."AchievementType" NOT NULL,
    "requirement" JSONB NOT NULL,
    "rewardCoins" INTEGER NOT NULL DEFAULT 50,
    "rewardXP" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "taskId" TEXT,
    "projectId" TEXT,
    "itemId" TEXT,
    "xpChange" INTEGER NOT NULL DEFAULT 0,
    "coinChange" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 50,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "intellect" INTEGER NOT NULL DEFAULT 10,
    "discipline" INTEGER NOT NULL DEFAULT 10,
    "health" INTEGER NOT NULL DEFAULT 10,
    "creativity" INTEGER NOT NULL DEFAULT 10,
    "social" INTEGER NOT NULL DEFAULT 10,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "avatarId" TEXT DEFAULT 'avatar_starter',
    "themeId" TEXT DEFAULT 'theme_classic',
    "skinId" TEXT,
    "frameId" TEXT,
    "titleId" TEXT DEFAULT 'title_apprentice',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "career" INTEGER NOT NULL DEFAULT 10,
    "emotional" INTEGER NOT NULL DEFAULT 10,
    "finance" INTEGER NOT NULL DEFAULT 10,
    "leadership" INTEGER NOT NULL DEFAULT 10,
    "learning" INTEGER NOT NULL DEFAULT 10,
    "personalGrowth" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "public"."FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ItemType" NOT NULL,
    "rarity" "public"."ItemRarity" NOT NULL DEFAULT 'COMMON',
    "price" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bonusXP" INTEGER NOT NULL DEFAULT 100,
    "bonusCoins" INTEGER NOT NULL DEFAULT 50,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StreakRecovery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "effort" "public"."Effort" NOT NULL DEFAULT 'MEDIUM',
    "impact" "public"."Impact" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "xpReward" INTEGER NOT NULL DEFAULT 25,
    "coinReward" INTEGER NOT NULL DEFAULT 10,
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "aiFlagged" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "primaryAttribute" "public"."Category" NOT NULL DEFAULT 'INTELLECT',
    "questType" "public"."QuestType",
    "secondaryAttributes" "public"."Category"[],
    "suspicion" "public"."SuspicionLevel" NOT NULL DEFAULT 'NORMAL',
    "timeScale" "public"."TimeScale",

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "googleId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_code_idx" ON "public"."Achievement"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "public"."Achievement"("code" ASC);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "public"."ActivityLog"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_type_idx" ON "public"."ActivityLog"("userId" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "public"."Character"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "public"."Character"("userId" ASC);

-- CreateIndex
CREATE INDEX "Friendship_receiverId_idx" ON "public"."Friendship"("receiverId" ASC);

-- CreateIndex
CREATE INDEX "Friendship_requesterId_idx" ON "public"."Friendship"("requesterId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_receiverId_key" ON "public"."Friendship"("requesterId" ASC, "receiverId" ASC);

-- CreateIndex
CREATE INDEX "Inventory_itemId_idx" ON "public"."Inventory"("itemId" ASC);

-- CreateIndex
CREATE INDEX "Inventory_userId_idx" ON "public"."Inventory"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_itemId_key" ON "public"."Inventory"("userId" ASC, "itemId" ASC);

-- CreateIndex
CREATE INDEX "Item_rarity_idx" ON "public"."Item"("rarity" ASC);

-- CreateIndex
CREATE INDEX "Item_type_idx" ON "public"."Item"("type" ASC);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "public"."Project"("userId" ASC);

-- CreateIndex
CREATE INDEX "Project_userId_status_idx" ON "public"."Project"("userId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "StreakRecovery_userId_usedAt_idx" ON "public"."StreakRecovery"("userId" ASC, "usedAt" ASC);

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "public"."Task"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "public"."Task"("projectId" ASC);

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "public"."Task"("userId" ASC);

-- CreateIndex
CREATE INDEX "Task_userId_status_idx" ON "public"."Task"("userId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "public"."User"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId" ASC, "achievementId" ASC);

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "public"."UserAchievement"("userId" ASC);

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "public"."VerificationToken"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_userId_key" ON "public"."VerificationToken"("userId" ASC);

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StreakRecovery" ADD CONSTRAINT "StreakRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

