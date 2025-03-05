import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    POSTGRES_URL: z.string().min(1).url(),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
    MINIO_ENDPOINT: z.string().min(1),
    MINIO_PORT: z
      .string()
      .min(1)
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val))
      .refine((val) => Number.isInteger(val))
      .refine((val) => val >= 1 && val <= 65535),
    MINIO_USE_SSL: z
      .string()
      .min(1)
      .refine(
        (val) =>
          val === "1" || val === "0" || val === "true" || val === "false",
      )
      .transform((val) => val === "1" || val === "true"),
    MINIO_USER: z.string().min(1),
    MINIO_PASSWORD: z.string().min(1),
    MINIO_BUCKET_NAME_MUSIC: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().min(1).url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
    MINIO_USER: process.env.MINIO_USER,
    MINIO_PASSWORD: process.env.MINIO_PASSWORD,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_USE_SSL: process.env.MINIO_USE_SSL,
    MINIO_BUCKET_NAME_MUSIC: process.env.MINIO_BUCKET_NAME_MUSIC,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
