const LeaderboardService = require('../services/rpg/leaderboard.service');
const { sendSuccess } = require('../utils/response');

class LeaderboardController {
  static async getGlobal(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const leaderboard = await LeaderboardService.getGlobalLeaderboard(limit);
      sendSuccess(res, leaderboard);
    } catch (error) {
      next(error);
    }
  }

  static async getWeekly(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const leaderboard = await LeaderboardService.getWeeklyLeaderboard(limit);
      sendSuccess(res, leaderboard);
    } catch (error) {
      next(error);
    }
  }

  static async getFriends(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const leaderboard = await LeaderboardService.getFriendsLeaderboard(req.user.id, limit);
      sendSuccess(res, leaderboard);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const rankData = await LeaderboardService.getMe(req.user.id);
      sendSuccess(res, rankData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeaderboardController;
