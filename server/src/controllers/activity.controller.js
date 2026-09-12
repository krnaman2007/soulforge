const ActivityService = require('../services/rpg/activity.service');
const { sendSuccess } = require('../utils/response');

class ActivityController {
  static async getActivity(req, res, next) {
    try {
      const feed = await ActivityService.getActivityFeed(req.user.id, req.query);
      return sendSuccess(res, feed, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getRecent(req, res, next) {
    try {
      const recent = await ActivityService.getRecentActivities(req.user.id, req.query.limit);
      return sendSuccess(res, recent, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const stats = await ActivityService.getActivityStats(req.user.id, req.query.period);
      return sendSuccess(res, stats, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ActivityController;
