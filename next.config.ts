import type { NextConfig } from "next";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  },
};

export default nextConfig;
