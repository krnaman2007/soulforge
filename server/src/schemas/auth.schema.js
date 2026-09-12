const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters')
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

const resendVerificationSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase()
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required')
});

module.exports = {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  verifyEmailSchema,
  googleAuthSchema
};
