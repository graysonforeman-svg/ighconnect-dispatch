import path from "path";
import { existsSync } from "fs";
import type { NextConfig } from "next";

/** Monorepo root when developing in igh-connect; repo root when synced to ighconnect-dispatch. */
const outputFileTracingRoot = existsSync(
  path.join(__dirname, "..", "..", "apps", "mobile-rider")
)
  ? path.join(__dirname, "..", "..")
  : __dirname;

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot,
  transpilePackages: ["@igh-connect/shared"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
