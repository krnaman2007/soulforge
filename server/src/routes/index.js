const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const socialRoutes = require('./social.routes');
const questRoutes = require('./quest.routes');
const challengeRoutes = require('./challenge.routes');
const achievementRoutes = require('./achievement.routes');
const leaderboardRoutes = require('./leaderboard.routes');

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', socialRoutes);
apiRouter.use('/tasks', require('./task.routes'));
apiRouter.use('/ai', require('./ai.routes'));
apiRouter.use('/quests', questRoutes);
apiRouter.use('/challenges', challengeRoutes);
apiRouter.use('/achievements', achievementRoutes);
apiRouter.use('/leaderboard', leaderboardRoutes);

module.exports = apiRouter;
