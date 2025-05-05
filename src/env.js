import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const booleanSchema = z
  .enum(["1", "0", "true", "false"])
  .transform((val) => val === "1" || val === "true");

const portSchema = z.coerce.number().int().min(1).max(65535);

export const env = createEnv({
  server: {
    HOSTNAME: z.string(),
    PORT: portSchema,
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    POSTGRES_URL: z.string().url(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: portSchema,
    MINIO_USE_SSL: booleanSchema,
    MINIO_USER: z.string(),
    MINIO_PASSWORD: z.string(),
    MINIO_BUCKET_NAME_MUSIC: z.string(),
    MINIO_BUCKET_NAME_ALBUM_IMAGES: z.string(),
    MINIO_BUCKET_NAME_ARTIST_IMAGES: z.string(),
    MINIO_BUCKET_NAME_PLAYLIST_IMAGES: z.string(),
    AUTH_SECRET: z.string(),
    AUTH_URL: z.string().url(),
    AUTH_TRUST_HOST: booleanSchema,
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    PROXY_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_IS_STAGING: booleanSchema,
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_IS_STAGING: process.env.NEXT_PUBLIC_IS_STAGING,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
