import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string().min(1),

  REDIS_URL: z.string().min(1),
});

type RawEnv = z.infer<typeof envSchema>;
export type EnvSchema = { [K in keyof RawEnv]-?: RawEnv[K] };
