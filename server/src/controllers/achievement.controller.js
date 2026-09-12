const AchievementService = require('../services/rpg/achievement.service');
const { sendSuccess } = require('../utils/response');

async function getAllAchievements(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const achievements = await AchievementService.getAllAchievements(userId, req.query);
    return sendSuccess(res, achievements, 200);
  } catch (err) {
    next(err);
  }
}

async function getMyAchievements(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await AchievementService.getMyAchievements(userId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function getAchievementById(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const achievement = await AchievementService.getAchievementById(userId, req.params.id);
    return sendSuccess(res, achievement, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllAchievements,
  getMyAchievements,
  getAchievementById
};
