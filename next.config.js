/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  devIndicators: false,
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: env.MINIO_USE_SSL ? "https" : "http",
        hostname: env.MINIO_ENDPOINT,
      },
    ],
  },
  experimental: {
    ppr: true,
  },
};

export default config;
