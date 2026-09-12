const { Router } = require('express');
const healthRoutes = require('./health.routes');

const apiRouter = Router();

apiRouter.use(healthRoutes);

module.exports = apiRouter;
