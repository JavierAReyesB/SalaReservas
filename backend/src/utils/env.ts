import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend directory
// Use process.cwd() instead of __dirname to ensure correct path resolution with ts-node-dev
dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  MONGO_URL: z.string().min(1),
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TZ: z.string().default('Europe/Madrid'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().default('onboarding@resend.dev'),
  COMPANY_NAME: z.string().default('reservaSalas'),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    console.log('\n💡 Verifica que existe el archivo backend/.env con:');
    console.log('   MONGO_URL=mongodb://localhost:27017');
    console.log('   PORT=4000');
    console.log('   NODE_ENV=development\n');
    process.exit(1);
  }
}

export const env = validateEnv();
