import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  basePath: "",
  ...(isDev && {
    allowedDevOrigins: [
      process.env.REPLIT_DEV_DOMAIN || "",
      "*.replit.dev",
      "*.kirk.replit.dev",
      "*.riker.replit.dev",
    ].filter(Boolean),
  }),
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
