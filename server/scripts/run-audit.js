require('dotenv').config();

async function runTests() {
  const BASE_URL = 'http://localhost:3000/api';
  console.log('--- STARTING AI & FUNCTIONAL AUDIT ---');

  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 'cuid-test-user-1', email: 'test@soulforge.gg' }, process.env.JWT_SECRET || 'd85ee3b8bccef425b9e68754908040fff616e38951105227ba332c2a72499a2c');
  
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const prisma = require('../src/db/prisma');
    
    await prisma.activityLog.deleteMany({ where: { userId: 'cuid-test-user-1' } });
    await prisma.task.deleteMany({ where: { userId: 'cuid-test-user-1' } });
    await prisma.character.deleteMany({ where: { userId: 'cuid-test-user-1' } });
    await prisma.user.deleteMany({ where: { id: 'cuid-test-user-1' } });

    await prisma.user.create({
      data: {
        id: 'cuid-test-user-1',
        email: 'test@soulforge.gg',
        name: 'TestHero',
        passwordHash: 'dummy',
        character: {
          create: {
            level: 1, xp: 0, coins: 0
          }
        }
      }
    });

    // Create Task (This will trigger Groq AI)
    console.log('1. Testing Task Creation with Groq AI...');
    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Drink a glass of water',
        description: 'Stay hydrated for better focus.'
      })
    });
    
    if (!createRes.ok) throw new Error(await createRes.text());
    const createData = await createRes.json();
    
    console.log(' - Task Created:', createData.data.title);
    const taskId = createData.data.id;
    console.log(' - AI analyzed (should be true)?', createData.data.aiAnalyzed);
    console.log(' - Primary Attribute from AI (should likely be HEALTH):', createData.data.primaryAttribute);
    console.log(' - Reward XP assigned:', createData.data.xpReward);

    // AI Direct Route Test
    console.log('\n2. Testing Direct AI Classification Endpoint...');
    const aiRes = await fetch(`${BASE_URL}/ai/tasks/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Read a book on software architecture'
      })
    });
    if (!aiRes.ok) throw new Error(await aiRes.text());
    const aiData = await aiRes.json();
    console.log(' - Direct AI Classification Passed.');
    console.log(' - Primary:', aiData.data.primaryAttribute);
    console.log(' - Secondary:', aiData.data.secondaryAttributes?.join(', '));
    console.log(' - Priority:', aiData.data.priority);
    console.log(' - Difficulty:', aiData.data.difficulty);

    console.log('\n--- ALL AI FUNCTIONAL TESTS PASSED ---');
    process.exit(0);

  } catch (err) {
    console.error('--- TEST FAILED ---');
    console.error(err.message);
    process.exit(1);
  }
}

runTests();
