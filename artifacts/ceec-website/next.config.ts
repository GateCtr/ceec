import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "",
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN || "",
    "*.replit.dev",
    "*.kirk.replit.dev",
  ].filter(Boolean),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
