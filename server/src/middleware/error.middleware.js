const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const env = require('../config/env');
const { ZodError } = require('zod');

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    return sendError(
      res,
      'VALIDATION_ERROR',
      'Request input validation failed',
      400,
      err.format()
    );
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'MALFORMED_JSON', 'Malformed JSON payload in request body', 400);
  }

  const message = err && err.message ? err.message : 'Internal Server Error';
  const stack = env.NODE_ENV === 'development' && err && err.stack ? err.stack : undefined;

  const logger = require('../errorlogging/logger');
  logger.error('Unhandled Exception:', {
    error: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: _req.requestId,
    method: _req.method,
    route: _req.originalUrl,
    userId: _req.user ? _req.user.id : undefined,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    status: 500
  });

  return sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : message,
    500,
    stack ? { stack } : undefined
  );
}

module.exports = {
  errorHandler
};
