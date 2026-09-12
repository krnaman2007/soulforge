const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_CONFIG } = require('../config/constants');
const { sendError } = require('../utils/response');

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.GLOBAL.windowMs,
  limit: RATE_LIMIT_CONFIG.GLOBAL.limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (_req, res) => {
    return sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests, please slow down',
      429
    );
  }
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH.windowMs,
  limit: RATE_LIMIT_CONFIG.AUTH.limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (_req, res) => {
    return sendError(
      res,
      'AUTH_RATE_LIMIT_EXCEEDED',
      'Too many authentication attempts, please try again in 15 minutes',
      429
    );
  }
});

const aiLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AI.windowMs,
  limit: RATE_LIMIT_CONFIG.AI.limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (_req, res) => {
    return sendError(
      res,
      'AI_RATE_LIMIT_EXCEEDED',
      'AI request limit reached, please wait a moment',
      429
    );
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  aiLimiter
};
