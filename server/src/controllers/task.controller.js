const TaskService = require('../services/tasks/task.service');
const TaskCompletionService = require('../services/tasks/taskCompletion.service');
const { sendSuccess } = require('../utils/response');

const getTasks = async (req, res, next) => {
  try {
    const tasks = await TaskService.getTasks(req.user.id, req.query);
    sendSuccess(res, tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await TaskService.createTask(req.user.id, req.body);
    sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await TaskService.updateTask(req.user.id, req.params.id, req.body);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const result = await TaskCompletionService.completeTask(req.user.id, req.params.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await TaskService.deleteTask(req.user.id, req.params.id);
    sendSuccess(res, { message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask
};
