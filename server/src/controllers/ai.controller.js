const TaskAnalyzerService = require('../services/ai/taskAnalyzer.service');
const ProjectPlannerService = require('../services/ai/projectPlanner.service');
const HabitPlannerService = require('../services/ai/habitPlanner.service');
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

module.exports = {
  analyzeTask,
  planProject,
  planHabit
};
