const ACHIEVEMENT_CATALOG = [
  {
    code: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'Complete your first task',
    type: 'TASK',
    requirement: { metric: 'TASK_COUNT', target: 1 },
    rewardXP: 100,
    rewardCoins: 50,
    badge: 'badge_first_blood',
    rewardTitle: 'Novice Adventurer'
  },
  {
    code: 'TASK_APPRENTICE',
    name: 'Apprentice',
    description: 'Complete 10 tasks',
    type: 'TASK',
    requirement: { metric: 'TASK_COUNT', target: 10 },
    rewardXP: 150,
    rewardCoins: 75,
    badge: 'badge_task_10',
    rewardTitle: 'Apprentice'
  },
  {
    code: 'TASK_VETERAN',
    name: 'Veteran',
    description: 'Complete 100 tasks',
    type: 'TASK',
    requirement: { metric: 'TASK_COUNT', target: 100 },
    rewardXP: 500,
    rewardCoins: 250,
    badge: 'badge_task_100',
    rewardTitle: 'Veteran'
  },
  {
    code: 'SCHOLAR',
    name: 'Scholar',
    description: 'Complete 25 INTELLECT tasks',
    type: 'TASK',
    requirement: { metric: 'ATTRIBUTE_TASK_COUNT', attribute: 'INTELLECT', target: 25 },
    rewardXP: 300,
    rewardCoins: 150,
    badge: 'badge_scholar',
    rewardTitle: 'Scholar'
  },
  {
    code: 'IRON_WILL',
    name: 'Iron Will',
    description: 'Complete 25 STRENGTH tasks',
    type: 'TASK',
    requirement: { metric: 'ATTRIBUTE_TASK_COUNT', attribute: 'STRENGTH', target: 25 },
    rewardXP: 300,
    rewardCoins: 150,
    badge: 'badge_iron_will',
    rewardTitle: 'Ironborn'
  },
  {
    code: 'CREATIVE_MIND',
    name: 'Creative Mind',
    description: 'Complete 25 CREATIVITY tasks',
    type: 'TASK',
    requirement: { metric: 'ATTRIBUTE_TASK_COUNT', attribute: 'CREATIVITY', target: 25 },
    rewardXP: 300,
    rewardCoins: 150,
    badge: 'badge_creative',
    rewardTitle: 'Artisan'
  },
  {
    code: 'EARLY_RISER',
    name: 'Early Riser',
    description: 'Complete a task before 8:00 AM',
    type: 'TASK',
    requirement: { metric: 'EARLY_RISER', beforeHour: 8 },
    rewardXP: 150,
    rewardCoins: 75,
    badge: 'badge_early_riser',
    rewardTitle: 'Dawnstrider'
  },
  {
    code: 'GETTING_SERIOUS',
    name: 'Getting Serious',
    description: 'Maintain a 7-day streak',
    type: 'STREAK',
    requirement: { metric: 'STREAK_DAYS', target: 7 },
    rewardXP: 200,
    rewardCoins: 100,
    badge: 'badge_streak_7',
    rewardTitle: 'Disciplined'
  },
  {
    code: 'UNSTOPPABLE',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    type: 'STREAK',
    requirement: { metric: 'STREAK_DAYS', target: 30 },
    rewardXP: 600,
    rewardCoins: 300,
    badge: 'badge_streak_30',
    rewardTitle: 'Iron Persistence'
  },
  {
    code: 'LEVEL_5',
    name: 'Novice Ascendant',
    description: 'Reach Level 5',
    type: 'LEVEL',
    requirement: { metric: 'LEVEL', target: 5 },
    rewardXP: 200,
    rewardCoins: 100,
    badge: 'badge_level_5',
    rewardTitle: 'Ascendant'
  },
  {
    code: 'LEVEL_10',
    name: 'Kingdom Sovereign',
    description: 'Reach Level 10',
    type: 'LEVEL',
    requirement: { metric: 'LEVEL', target: 10 },
    rewardXP: 500,
    rewardCoins: 250,
    badge: 'badge_level_10',
    rewardTitle: 'Sovereign'
  },
  {
    code: 'CAMPAIGNER',
    name: 'Campaigner',
    description: 'Complete your first Quest',
    type: 'PROJECT',
    requirement: { metric: 'QUEST_COUNT', target: 1 },
    rewardXP: 250,
    rewardCoins: 150,
    badge: 'badge_campaigner',
    rewardTitle: 'Campaigner'
  },
  {
    code: 'CHALLENGER',
    name: 'Challenger',
    description: 'Complete and claim 10 Daily Challenges',
    type: 'CHALLENGE',
    requirement: { metric: 'CHALLENGE_COUNT', challengeType: 'DAILY', target: 10 },
    rewardXP: 400,
    rewardCoins: 200,
    badge: 'badge_challenger',
    rewardTitle: 'Contender'
  },
  {
    code: 'DEDICATED',
    name: 'Dedicated',
    description: 'Complete and claim 4 Weekly Challenges',
    type: 'CHALLENGE',
    requirement: { metric: 'CHALLENGE_COUNT', challengeType: 'WEEKLY', target: 4 },
    rewardXP: 800,
    rewardCoins: 400,
    badge: 'badge_dedicated',
    rewardTitle: 'Crusader'
  },
  {
    code: 'HOARDER',
    name: 'Hoarder',
    description: 'Accumulate 1,000 Coins',
    type: 'ECONOMY',
    requirement: { metric: 'COIN_BALANCE', target: 1000 },
    rewardXP: 300,
    rewardCoins: 100,
    badge: 'badge_hoarder',
    rewardTitle: 'Treasurer'
  }
];

module.exports = {
  ACHIEVEMENT_CATALOG
};
