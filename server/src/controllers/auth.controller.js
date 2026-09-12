const authService = require('../services/auth');
const { sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

function logout(_req, res) {
  return sendSuccess(res, { message: 'Successfully logged out' }, 200);
}

async function me(req, res, next) {
  try {
    const data = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const data = await authService.verifyEmailToken(req.body.token);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    const data = await authService.resendVerificationLink(req.body.email);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function googleLogin(req, res, next) {
  try {
    const data = await authService.loginWithGoogle(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function checkUsername(req, res, next) {
  try {
    const data = await authService.checkUsernameAvailability(req.query.username);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function setUsername(req, res, next) {
  try {
    const data = await authService.setUsername(req.user.id, req.body.username);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  verifyEmail,
  resendVerification,
  googleLogin,
  checkUsername,
  setUsername
};

