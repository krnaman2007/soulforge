const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('soulforge_secret_jwt_key_tech_zephyr_4_hackathon_2026'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GOOGLE_API_KEY: z.string().optional().default(''),
  LLM_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Email / Resend (Optional - logs to console in development if unset)
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('SoulForge <no-reply@soulforge.gg>'),

  // Google OAuth (Optional - accepts ID tokens or client code)
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_REDIRECT_URI: z.string().optional().default('http://localhost:3000/api/auth/google/callback')
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[ERROR] Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
}

const env = parseEnv();

module.exports = env;
