const ChallengeService = require('../services/quests/challenge.service');
const { sendSuccess } = require('../utils/response');

async function getDailyChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const challenge = await ChallengeService.getDailyChallenge(userId);
    return sendSuccess(res, challenge, 200);
  } catch (err) {
    next(err);
  }
}

async function getWeeklyChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const challenge = await ChallengeService.getWeeklyChallenge(userId);
    return sendSuccess(res, challenge, 200);
  } catch (err) {
    next(err);
  }
}

async function claimChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await ChallengeService.claimChallenge(userId, req.params.type);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDailyChallenge,
  getWeeklyChallenge,
  claimChallenge
};
