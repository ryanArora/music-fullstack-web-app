/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  devIndicators: false,
  images: {
    remotePatterns: [new URL(env.NEXT_PUBLIC_MINIO_URL)],
  },
  experimental: {
    ppr: true,
  },
};

export default config;
