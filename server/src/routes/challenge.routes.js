const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validateParams } = require('../middleware/validation.middleware');
const { challengeTypeParamSchema } = require('../schemas/challenge.schema');
const {
  getDailyChallenge,
  getWeeklyChallenge,
  claimChallenge
} = require('../controllers/challenge.controller');

const router = Router();

// Authentication required for all challenge operations
router.use(authenticate);

router.get('/daily', getDailyChallenge);
router.get('/weekly', getWeeklyChallenge);
router.post('/:type/claim', validateParams(challengeTypeParamSchema), claimChallenge);

module.exports = router;
