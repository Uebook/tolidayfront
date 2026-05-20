import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/staff/:path*',
        destination: '/hotel/staff/:path*',
      },
      {
        source: '/rooms/:path*',
        destination: '/hotel/rooms/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
