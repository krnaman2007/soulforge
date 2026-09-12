const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/tasks', require('./task.routes'));
apiRouter.use('/ai', require('./ai.routes'));

module.exports = apiRouter;
