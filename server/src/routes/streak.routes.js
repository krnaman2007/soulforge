const { Router } = require('express');
const StreakController = require('../controllers/streak.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

// Authentication required for streak recovery operations
router.use(authenticate);

// POST /api/v1/streak/recover (or /api/streak/recover)
router.post('/recover', StreakController.recoverStreak);

module.exports = router;
