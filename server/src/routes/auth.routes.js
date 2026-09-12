const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validation.middleware');
const {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  verifyEmailSchema,
  googleAuthSchema
} = require('../schemas/auth.schema');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

// Standard password auth
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

// Email verification
router.post('/resend-verification', authLimiter, validateBody(resendVerificationSchema), authController.resendVerification);
router.post('/verify-email', authLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);

// Google OAuth
router.post('/google', authLimiter, validateBody(googleAuthSchema), authController.googleLogin);

module.exports = router;
