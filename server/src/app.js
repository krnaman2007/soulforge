const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/notFound.middleware');
const apiRouter = require('./routes/index');

function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    })
  );

  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(globalLimiter);

  // Dual API version mount: /api/v1 (canonical) and /api (backward compatible)
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;

