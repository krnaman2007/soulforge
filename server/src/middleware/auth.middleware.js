const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      'UNAUTHORIZED',
      'Access token missing or malformed',
      401
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.id || !decoded.email) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid token payload', 401);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (_err) {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }
}

module.exports = {
  authenticate
};
