const TaskAnalyzerService = require('../services/ai/taskAnalyzer.service');
const ProjectPlannerService = require('../services/ai/projectPlanner.service');
const HabitPlannerService = require('../services/ai/habitPlanner.service');
const AiQuestGeneratorService = require('../services/ai/aiQuestGenerator.service');
const { sendSuccess } = require('../utils/response');

const analyzeTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const analysis = await TaskAnalyzerService.analyzeTask(title, description);
    sendSuccess(res, analysis);
  } catch (error) {
    next(error);
  }
};

const planProject = async (req, res, next) => {
  try {
    const { goal } = req.body;
    const plan = await ProjectPlannerService.planProject(goal);
    sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
};

const planHabit = async (req, res, next) => {
  try {
    const { habitGoal } = req.body;
    const plan = await HabitPlannerService.planHabit(habitGoal);
    sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
};

const createQuest = async (req, res, next) => {
  try {
    const result = await AiQuestGeneratorService.createQuest(req.user.id, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

const generateQuest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await AiQuestGeneratorService.generateQuest(userId, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeTask,
  planProject,
  planHabit,
  generateQuest,
  createQuest
};
