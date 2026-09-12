const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const env = require('../config/env');
const { ZodError } = require('zod');
const logger = require('../errorlogging/logger');

function errorHandler(err, req, res, _next) {
  // 1. Handled Operational Errors
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  // 2. Zod Schema Validation Errors
  if (err instanceof ZodError) {
    return sendError(
      res,
      'VALIDATION_ERROR',
      'Request input validation failed',
      400,
      err.format()
    );
  }

  // 3. Syntax / JSON Parsing Errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'MALFORMED_JSON', 'Malformed JSON payload in request body', 400);
  }

  // 4. Centralized Prisma Error Mapping
  if (err && err.code) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = err.meta && err.meta.target ? err.meta.target : 'field';
      return sendError(
        res,
        'DUPLICATE_RESOURCE',
        `A resource with conflicting unique value (${Array.isArray(target) ? target.join(', ') : target}) already exists`,
        409,
        err.meta
      );
    }

    // Record not found
    if (err.code === 'P2025') {
      return sendError(
        res,
        'RESOURCE_NOT_FOUND',
        'The requested record was not found or has been deleted',
        404
      );
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return sendError(
        res,
        'FOREIGN_KEY_VIOLATION',
        'Operation references a related entity that does not exist',
        400
      );
    }
  }

  // 5. Unhandled Exceptions
  const message = err && err.message ? err.message : 'Internal Server Error';
  const stack = env.NODE_ENV === 'development' && err && err.stack ? err.stack : undefined;

  logger.error('Unhandled Exception:', {
    error: err.message,
    stack,
    requestId: req.requestId,
    method: req.method,
    route: req.originalUrl,
    userId: req.user ? req.user.id : undefined,
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
