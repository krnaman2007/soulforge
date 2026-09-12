const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validation.middleware');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
