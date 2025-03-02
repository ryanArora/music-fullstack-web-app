import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // NextAuth.js environment variables
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
