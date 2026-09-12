const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const socialRoutes = require('./social.routes');
const questRoutes = require('./quest.routes');
const challengeRoutes = require('./challenge.routes');

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', socialRoutes);
apiRouter.use('/tasks', require('./task.routes'));
apiRouter.use('/ai', require('./ai.routes'));
apiRouter.use('/quests', questRoutes);
apiRouter.use('/challenges', challengeRoutes);

module.exports = apiRouter;
