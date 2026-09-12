const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = require('./src/db/prisma');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./src/config/env');

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found.");
    process.exit(0);
  }
  
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  
  const plan = {
    questName: "Test Quest API",
    goal: "Learn React Via API",
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
    const res = await axios.post('http://localhost:3000/api/v1/ai/quests/create', plan, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("ERROR:", err.response?.status, err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
