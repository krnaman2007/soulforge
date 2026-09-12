const QuestService = require('../services/quests/quest.service');
const { sendSuccess } = require('../utils/response');

async function createQuest(req, res, next) {
  try {
    const userId = req.user.id;
    const quest = await QuestService.createQuest(userId, req.body);
    return sendSuccess(res, quest, 201);
  } catch (err) {
    next(err);
  }
}

async function listQuests(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await QuestService.listQuests(userId, req.query);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function getQuestById(req, res, next) {
  try {
    const userId = req.user.id;
    const quest = await QuestService.getQuestById(userId, req.params.id);
    return sendSuccess(res, quest, 200);
  } catch (err) {
    next(err);
  }
}

async function getQuestProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const progress = await QuestService.getQuestProgress(userId, req.params.id);
    return sendSuccess(res, progress, 200);
  } catch (err) {
    next(err);
  }
}

async function updateQuest(req, res, next) {
  try {
    const userId = req.user.id;
    const updated = await QuestService.updateQuest(userId, req.params.id, req.body);
    return sendSuccess(res, updated, 200);
  } catch (err) {
    next(err);
  }
}

async function deleteQuest(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await QuestService.deleteQuest(userId, req.params.id);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuest,
  listQuests,
  getQuestById,
  getQuestProgress,
  updateQuest,
  deleteQuest
};
