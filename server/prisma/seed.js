const prisma = require('../src/db/prisma');
const { ACHIEVEMENT_CATALOG } = require('../src/config/achievementCatalog');
const { ITEM_CATALOG } = require('../src/config/itemCatalog');

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

async function seedItems() {
  console.log('Seeding SoulForge Cosmetic Shop Catalog...');
  let count = 0;

  for (const item of ITEM_CATALOG) {
    await prisma.item.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        price: item.price,
        metadata: item.metadata
      },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        price: item.price,
        metadata: item.metadata
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} cosmetic shop items.`);
}

async function main() {
  try {
    await seedAchievements();
    await seedItems();
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
  seedAchievements,
  seedItems
};

