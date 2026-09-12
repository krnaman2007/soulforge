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
  }
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
  RATE_LIMIT_CONFIG
};
