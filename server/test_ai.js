const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = require('./src/db/prisma');
const AiQuestGeneratorService = require('./src/services/ai/aiQuestGenerator.service');

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found.");
    process.exit(0);
  }
  
  const plan = {
    questName: "Test Quest",
    goal: "Learn React",
    category: "INTELLECT",
    difficulty: "MEDIUM",
    bonusXP: 100,
    bonusCoins: 50,
    phases: [],
    tasks: [
      {
        title: "Learn JSX",
        description: "Phase 1: Learn JSX",
        primaryAttribute: "INTELLECT",
        difficulty: "MEDIUM",
        xpReward: 25,
        coinReward: 10,
        aiAnalyzed: true,
        aiConfidence: 0.95
      }
    ]
  };

  try {
    const result = await AiQuestGeneratorService.createQuest(user.id, plan);
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message, err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
