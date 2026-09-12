const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('soulforge_secret_jwt_key_tech_zephyr_4_hackathon_2026'),
  LLM_API_KEY: z.string().optional().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5001),
  FRONTEND_URL: z.string().default('http://localhost:5173')
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
