const { Router } = require('express');
const ActivityController = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateQuery } = require('../middleware/validation.middleware');
const {
  listActivityQuerySchema,
  recentActivityQuerySchema,
  activityStatsQuerySchema
} = require('../schemas/activity.schema');

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listActivityQuerySchema), ActivityController.getActivity);
router.get('/recent', validateQuery(recentActivityQuerySchema), ActivityController.getRecent);
router.get('/stats', validateQuery(activityStatsQuerySchema), ActivityController.getStats);

module.exports = router;
