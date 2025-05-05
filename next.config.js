/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: env.NEXT_PUBLIC_MINIO_URL.startsWith("https://")
          ? "https"
          : "http",
        hostname: new URL(env.NEXT_PUBLIC_MINIO_URL).hostname,
        port: new URL(env.NEXT_PUBLIC_MINIO_URL).port,
      },
    ],
  },
  experimental: {
    ppr: true,
  },
};

export default config;
