const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding rewards...');

  const rewards = [
    {
      name: 'Swiggy Discount',
      brand: 'Swiggy',
      description: 'Get ₹100 off on your next food delivery order above ₹299.',
      category: 'FOOD',
      rarity: 'COMMON',
      xpCost: 1500,
      discountValue: '₹100 OFF',
      totalStock: 500,
      remainingStock: 500,
      isFlash: false,
    },
    {
      name: 'Zomato Pro Month',
      brand: 'Zomato',
      description: 'Unlock 1 month of Zomato Pro free delivery benefits.',
      category: 'FOOD',
      rarity: 'RARE',
      xpCost: 3000,
      discountValue: '1 Month Free',
      totalStock: 100,
      remainingStock: 100,
      isFlash: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      name: 'Amazon Gift Card',
      brand: 'Amazon',
      description: '₹500 Amazon Pay Gift Card to shop anything.',
      category: 'SHOPPING',
      rarity: 'EPIC',
      xpCost: 10000,
      discountValue: '₹500 Value',
      totalStock: 20,
      remainingStock: 20,
      isFlash: false,
    },
    {
      name: 'Steam Wallet Code',
      brand: 'Steam',
      description: '₹250 added to your Steam Wallet.',
      category: 'GAMING',
      rarity: 'RARE',
      xpCost: 5000,
      discountValue: '₹250 Value',
      totalStock: 50,
      remainingStock: 3, // Low stock example
      isFlash: true,
    },
    {
      name: 'Udemy Course Coupon',
      brand: 'Udemy',
      description: 'Get any course on Udemy for 90% off.',
      category: 'LEARNING',
      rarity: 'COMMON',
      xpCost: 2000,
      discountValue: '90% OFF',
      totalStock: 1000,
      remainingStock: 1000,
      isFlash: false,
    },
    {
      name: 'Netflix Premium (1 Month)',
      brand: 'Netflix',
      description: 'Enjoy 1 month of Netflix Premium 4K.',
      category: 'ENTERTAINMENT',
      rarity: 'LEGENDARY',
      xpCost: 15000,
      discountValue: '1 Month Free',
      totalStock: 5,
      remainingStock: 5,
      isFlash: false,
    },
    {
      name: 'Uber Ride Voucher',
      brand: 'Uber',
      description: '₹150 off on your next 2 Uber Premier rides.',
      category: 'TRAVEL',
      rarity: 'COMMON',
      xpCost: 2500,
      discountValue: '₹150 OFF x 2',
      totalStock: 200,
      remainingStock: 200,
      isFlash: false,
    },
    {
      name: 'GitHub Pro (6 Months)',
      brand: 'GitHub',
      description: 'Upgrade your developer workflow with 6 months of GitHub Pro.',
      category: 'TECH',
      rarity: 'EPIC',
      xpCost: 12000,
      discountValue: '6 Months Free',
      totalStock: 10,
      remainingStock: 10,
      isFlash: false,
    },
    {
      name: 'Starbucks Coffee',
      brand: 'Starbucks',
      description: 'Free Tall Frappuccino of your choice.',
      category: 'FOOD',
      rarity: 'RARE',
      xpCost: 3500,
      discountValue: '1 Free Drink',
      totalStock: 150,
      remainingStock: 150,
      isFlash: false,
    },
    {
      name: 'Myntra Discount',
      brand: 'Myntra',
      description: 'Flat ₹300 off on purchases over ₹999.',
      category: 'SHOPPING',
      rarity: 'COMMON',
      xpCost: 1000,
      discountValue: '₹300 OFF',
      totalStock: null, // Unlimited stock
      remainingStock: null,
      isFlash: false,
    }
  ];

  for (const reward of rewards) {
    await prisma.reward.create({
      data: reward,
    });
  }

  console.log('Successfully seeded rewards!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
