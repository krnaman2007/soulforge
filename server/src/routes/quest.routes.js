const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation.middleware');
const {
  createQuestSchema,
  updateQuestSchema,
  questIdParamSchema,
  listQuestsQuerySchema
} = require('../schemas/quest.schema');
const {
  createQuest,
  listQuests,
  getQuestById,
  getQuestProgress,
  updateQuest,
  deleteQuest
} = require('../controllers/quest.controller');

const router = Router();

// Authentication required for all quest operations
router.use(authenticate);

router.post('/', validateBody(createQuestSchema), createQuest);
router.get('/', validateQuery(listQuestsQuerySchema), listQuests);
router.get('/:id', validateParams(questIdParamSchema), getQuestById);
router.get('/:id/progress', validateParams(questIdParamSchema), getQuestProgress);
router.patch('/:id', validateParams(questIdParamSchema), validateBody(updateQuestSchema), updateQuest);
router.delete('/:id', validateParams(questIdParamSchema), deleteQuest);

module.exports = router;
