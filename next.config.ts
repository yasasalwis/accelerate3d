import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prusa3d.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.anycubic.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.elegoo.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.qidi3d.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sovol3d.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.flashforge.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.artillery3d.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kingroon.com',
      },
    ],
  },
};

export default nextConfig;
