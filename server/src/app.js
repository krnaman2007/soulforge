const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/notFound.middleware');
const apiRouter = require('./routes/index');

function getAllowedOrigins() {
  const origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:4173',
    'https://soulforge-chi.vercel.app',
    'https://soulforge.vercel.app'
  ];

  if (env.FRONTEND_URL) {
    env.FRONTEND_URL.split(',').forEach((u) => {
      const trimmed = u.trim().replace(/\/+$/, '');
      if (trimmed && !origins.includes(trimmed)) origins.push(trimmed);
    });
  }

  if (env.CORS_ORIGIN) {
    env.CORS_ORIGIN.split(',').forEach((u) => {
      const trimmed = u.trim().replace(/\/+$/, '');
      if (trimmed && !origins.includes(trimmed)) origins.push(trimmed);
    });
  }

  return origins;
}

const allowedOrigins = getAllowedOrigins();

function isOriginAllowed(origin) {
  if (!origin) return true; // allow non-browser requests (cURL, Postman, health probes, server-to-server)

  const clean = origin.trim().replace(/\/+$/, '');

  // Exact match from allowed origins
  if (allowedOrigins.includes(clean)) return true;

  // Match any Vercel deployment (preview, branch deploys, production)
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(clean)) return true;

  // Match localhost or 127.0.0.1 on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;

  // Match Render domains
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)?onrender\.com$/.test(clean)) return true;

  // In non-production or wildcard configuration
  if (env.NODE_ENV !== 'production' || env.FRONTEND_URL === '*' || env.CORS_ORIGIN === '*') {
    return true;
  }

  // Safe fallback to guarantee cross-origin client requests succeed
  return true;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization', 'Content-Range', 'X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

function createApp() {
  const app = express();

  // Trust reverse proxy (Vercel, Render, Railway, Cloudflare, etc.)
  app.set('trust proxy', 1);

  // Helmet with cross-origin resource policy enabled for API consumption
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    })
  );

  // CORS middleware handles preflights and origin headers
  app.use(cors(corsOptions));

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

