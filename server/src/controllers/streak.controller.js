const StreakService = require('../services/rpg/streak.service');
const { sendSuccess } = require('../utils/response');

async function recoverStreak(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await StreakService.recoverStreak(userId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recoverStreak
};
