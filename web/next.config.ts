import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: '/api/ws/:path*',
      },
    ];
  },
};

export default nextConfig;
