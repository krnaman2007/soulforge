const prisma = require('../src/db/prisma');
const { ACHIEVEMENT_CATALOG } = require('../src/config/achievementCatalog');

async function seedAchievements() {
  console.log('Seeding SoulForge Achievement Catalog...');
  let count = 0;

  for (const ach of ACHIEVEMENT_CATALOG) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
        name: ach.name,
        description: ach.description,
        type: ach.type,
        requirement: ach.requirement,
        rewardCoins: ach.rewardCoins,
        rewardXP: ach.rewardXP,
        badge: ach.badge,
        rewardTitle: ach.rewardTitle
      },
      create: {
        code: ach.code,
        name: ach.name,
        description: ach.description,
        type: ach.type,
        requirement: ach.requirement,
        rewardCoins: ach.rewardCoins,
        rewardXP: ach.rewardXP,
        badge: ach.badge,
        rewardTitle: ach.rewardTitle
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} achievements.`);
}

async function main() {
  try {
    await seedAchievements();
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  seedAchievements
};
