const express = require('express');
const { getTasks, createTask, updateTask, completeTask, deleteTask } = require('../controllers/task.controller');
const { validateBody, validateParams } = require('../middleware/validation.middleware');
const { createTaskSchema, updateTaskSchema, taskIdSchema } = require('../schemas/task.schema');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getTasks)
  .post(validateBody(createTaskSchema), createTask);

router.route('/:id')
  .put(validateParams(taskIdSchema), validateBody(updateTaskSchema), updateTask)
  .delete(validateParams(taskIdSchema), deleteTask);

router.post('/:id/complete', validateParams(taskIdSchema), completeTask);

module.exports = router;
