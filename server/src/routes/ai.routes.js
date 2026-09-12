const express = require('express');
const { analyzeTask, planProject, planHabit, generateQuest } = require('../controllers/ai.controller');
const { validateBody } = require('../middleware/validation.middleware');
const { analyzeTaskSchema, planProjectSchema, planHabitSchema, generateQuestAiSchema } = require('../schemas/ai.schema');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/tasks/analyze', validateBody(analyzeTaskSchema), analyzeTask);
router.post('/projects/plan', validateBody(planProjectSchema), planProject);
router.post('/habit-plan', validateBody(planHabitSchema), planHabit);
router.post('/quests/generate', validateBody(generateQuestAiSchema), generateQuest);

module.exports = router;

