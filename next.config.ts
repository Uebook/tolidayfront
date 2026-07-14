import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable Webpack's CaseSensitivePathsPlugin warning and behavior to avoid Windows folder casing mismatches
    config.resolve.symlinks = false;
    
    // Ignore all Webpack warnings to prevent memory exhaustion and crashes on Plesk
    config.ignoreWarnings = [
      /multiple modules with names that only differ in casing/i,
      (warning: any) => true,
    ];

    // Disable caching to prevent "Unable to snapshot resolve dependencies" errors and reduce memory usage on Plesk
    config.cache = false;

    return config;
  },
};

export default nextConfig;
