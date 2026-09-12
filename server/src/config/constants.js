const RPG_CONSTANTS = {
  BASE_XP_SCALE: 100,
  LEVEL_EXPONENT: 1.6,

  DIFFICULTY_XP: {
    EASY: 15,
    MEDIUM: 30,
    HARD: 60,
    EPIC: 100
  },

  EFFORT_MULTIPLIER: {
    LOW: 1.0,
    MEDIUM: 1.25,
    HIGH: 1.5
  },

  IMPACT_BONUS: {
    LOW: 0,
    MEDIUM: 5,
    HIGH: 15
  },

  PRIORITY_BONUS: {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 5,
    URGENT: 10
  },

  COIN_REWARD_RATIO: 0.4,
  MIN_COIN_REWARD: 5,

  ATTRIBUTE_GAIN: {
    EASY: 2,
    MEDIUM: 4,
    HARD: 7,
    EPIC: 12
  },

  STREAK_RECOVERY_COIN_COST: 50,
  STREAK_RECOVERY_COOLDOWN_DAYS: 7,

  STARTER_STATS: {
    LEVEL: 1,
    XP: 0,
    COINS: 50,
    DEFAULT_ATTRIBUTE_VALUE: 10,
    AVATAR_ID: 'avatar_starter',
    THEME_ID: 'theme_classic',
    TITLE_ID: 'title_apprentice'
  },

  QUEST_DIFFICULTY_REWARDS: {
    EASY: { xp: 100, coins: 50 },
    MEDIUM: { xp: 250, coins: 120 },
    HARD: { xp: 500, coins: 250 },
    EPIC: { xp: 1000, coins: 500 }
  },

  CHALLENGE_CONFIG: {
    DAILY: {
      targetCount: 3,
      xpReward: 150,
      coinReward: 75,
      title: 'Daily Heroics',
      description: 'Complete 3 tasks in a single day.'
    },
    WEEKLY: {
      targetCount: 15,
      xpReward: 750,
      coinReward: 400,
      title: 'Weekly Grand Crusade',
      description: 'Complete 15 tasks this week.'
    }
  }
};

const ANTI_CHEAT = {
  MIN_COMPLETION_TIME_MS: 3000,
  MAX_DAILY_COMPLETIONS: 50,
  SUSPICIOUS_EFFORT_REDUCTION: 0.5,
  HIGH_RISK_REDUCTION: 0
};

const AI_CONFIG = {
  GEMINI_MODEL: 'gemini-1.5-flash',
  GEMINI_TIMEOUT_MS: 8000,
  GROQ_TIMEOUT_MS: 5000,
  FALLBACK_CONFIDENCE: 0.85
};

const VALIDATION_CONFIG = {
  MAX_TASK_TITLE_LENGTH: 100,
  MAX_TASK_DESCRIPTION_LENGTH: 1000,
  MAX_PROJECT_NAME_LENGTH: 50
};

const RATE_LIMIT_CONFIG = {
  GLOBAL: {
    windowMs: 60 * 1000,
    limit: 150
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    limit: 10
  },
  AI: {
    windowMs: 60 * 1000,
    limit: 15
  }
};

module.exports = {
  RPG_CONSTANTS,
  ANTI_CHEAT,
  AI_CONFIG,
  VALIDATION_CONFIG,
  RATE_LIMIT_CONFIG
};
