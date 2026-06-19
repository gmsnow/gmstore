import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: 15728640, // 15MB
  },
};

export default nextConfig;
