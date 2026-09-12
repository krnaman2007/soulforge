const { sendError } = require('../utils/response');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Request body failed validation',
        400,
        result.error.format()
      );
    }
    req.body = result.data;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Request query parameters failed validation',
        400,
        result.error.format()
      );
    }
    req.query = result.data;
    next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Request URL parameters failed validation',
        400,
        result.error.format()
      );
    }
    req.params = result.data;
    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
