import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
};

export default nextConfig;
 