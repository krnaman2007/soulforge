const express = require('express');
const LeaderboardController = require('../controllers/leaderboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/global', LeaderboardController.getGlobal);
router.get('/weekly', LeaderboardController.getWeekly);
router.get('/friends', LeaderboardController.getFriends);
router.get('/me', LeaderboardController.getMe);

module.exports = router;
