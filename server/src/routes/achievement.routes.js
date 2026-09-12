const { Router } = require('express');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { validateQuery, validateParams } = require('../middleware/validation.middleware');
const {
  listAchievementsQuerySchema,
  achievementIdParamSchema
} = require('../schemas/achievement.schema');
const {
  getAllAchievements,
  getMyAchievements,
  getAchievementById
} = require('../controllers/achievement.controller');

const router = Router();

// Route ordering: /me MUST precede /:id
router.get('/me', authenticate, getMyAchievements);
router.get('/', optionalAuthenticate, validateQuery(listAchievementsQuerySchema), getAllAchievements);
router.get('/:id', optionalAuthenticate, validateParams(achievementIdParamSchema), getAchievementById);

module.exports = router;
