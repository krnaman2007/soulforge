const prisma = require('../../db/prisma');
const DateService = require('../utils/date.service');
const LevelService = require('./level.service');
const { AppError } = require('../../utils/errors');

class LeaderboardService {
  /**
   * Helper to compute the global weekly boundary using UTC for consistency across players.
   */
  static _getWeeklyBoundary() {
    return DateService.getStartOfUserWeek('UTC');
  }

  /**
   * Shared helper to construct the leaderboard from ActivityLog aggregations
   * @param {Array<string>} userIds - Optional array of userIds to filter by
   * @param {number} limit
   * @param {boolean} lifetime - If true, sorts by lifetime XP instead of weekly
   */
  static async _buildLeaderboard(userIds = null, limit = 100, lifetime = false) {
    if (lifetime) {
      // For Lifetime, rank primarily by highest level, then highest remaining XP
      const where = userIds ? { userId: { in: userIds } } : {};
      const characters = await prisma.character.findMany({
        where,
        orderBy: [
          { level: 'desc' },
          { xp: 'desc' }
        ],
        take: limit,
        include: {
          user: { select: { id: true, username: true, name: true } }
        }
      });

      return characters.map((char, index) => {
        const totalXP = LevelService.calculateTotalXP(char.level, char.xp);
        const { rankTitle, tier } = LevelService.getRankTier(totalXP);
        return {
          rank: index + 1,
          user: {
            id: char.user.id,
            username: char.user.username || char.user.name,
            avatarId: char.avatarId,
            level: char.level
          },
          xp: totalXP,
          levelXP: char.xp,
          currentStreak: char.currentStreak,
          rankTitle,
          tier
        };
      });
    }

    // For Weekly, we aggregate canonical economic XP events (XP_GAINED)
    const startOfWeek = this._getWeeklyBoundary();
    const where = {
      createdAt: { gte: startOfWeek },
      type: 'XP_GAINED',
      xpChange: { gt: 0 }
    };

    if (userIds) {
      where.userId = { in: userIds };
    }

    const aggregations = await prisma.activityLog.groupBy({
      by: ['userId'],
      where,
      _sum: {
        xpChange: true
      },
      orderBy: {
        _sum: {
          xpChange: 'desc'
        }
      },
      take: limit
    });

    // We now have the sorted userIds and their weekly XP, but need to hydrate their character/user info
    const hydratedUserIds = aggregations.map(a => a.userId);
    const characters = await prisma.character.findMany({
      where: { userId: { in: hydratedUserIds } },
      include: {
        user: { select: { id: true, username: true, name: true } }
      }
    });

    // Map characters to dictionary for O(1) lookup
    const charMap = {};
    for (const char of characters) {
      charMap[char.userId] = char;
    }

    return aggregations.map((agg, index) => {
      const char = charMap[agg.userId];
      const totalXP = LevelService.calculateTotalXP(char?.level || 1, char?.xp || 0);
      const { rankTitle, tier } = LevelService.getRankTier(totalXP);
      return {
        rank: index + 1,
        user: {
          id: char?.user?.id,
          username: char?.user?.username || char?.user?.name || 'Unknown',
          avatarId: char?.avatarId || 'avatar_starter',
          level: char?.level || 1
        },
        weeklyXP: agg._sum.xpChange || 0,
        currentStreak: char?.currentStreak || 0,
        rankTitle,
        tier
      };
    });
  }

  /**
   * Gets the global leaderboard by Weekly XP
   */
  static async getWeeklyLeaderboard(limit = 100) {
    return await this._buildLeaderboard(null, limit, false);
  }

  /**
   * Gets the global leaderboard by Lifetime XP
   */
  static async getGlobalLeaderboard(limit = 100) {
    return await this._buildLeaderboard(null, limit, true);
  }

  static async getFriendsLeaderboard(userId, limit = 100) {
    // Get all users the current user follows
    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId
      }
    });

    const friendIds = follows.map(f => f.followingId);
    
    // Always include the requesting user in their own friends leaderboard to see where they rank
    friendIds.push(userId);

    return await this._buildLeaderboard(friendIds, limit, false);
  }

  /**
   * Retrieves the current user's specific rank on the weekly leaderboard
   */
  static async getMe(userId) {
    // Due to groupBy constraints, getting exact rank requires fetching all users with more XP
    // or generating the whole leaderboard. For MVP/Hackathon, we fetch the full weekly leaderboard
    // (with a reasonable upper bound) and find the user.
    // In production, you would use a Redis sorted set for O(log(N)) ranking.
    
    // For safety, fetch top 1000
    const fullLeaderboard = await this._buildLeaderboard(null, 1000, false);
    
    const userRankEntry = fullLeaderboard.find(entry => entry.user.id === userId);

    if (userRankEntry) {
      return userRankEntry;
    }

    // If user is unranked (0 weekly XP or beyond rank 1000)
    const character = await prisma.character.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!character) {
      throw new AppError('Character not found', 404, 'CHARACTER_NOT_FOUND');
    }

    const totalXP = LevelService.calculateTotalXP(character.level, character.xp);
    const { rankTitle, tier } = LevelService.getRankTier(totalXP);

    return {
      rank: null,
      user: {
        id: character.user.id,
        username: character.user.username || character.user.name,
        avatarId: character.avatarId,
        level: character.level
      },
      weeklyXP: 0,
      currentStreak: character.currentStreak,
      rankTitle,
      tier
    };
  }
}

module.exports = LeaderboardService;
