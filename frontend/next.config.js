/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless", "ws"],
  },
  // Expose Vercel system env vars to the client so Better Auth can construct absolute URLs
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "",
  },
};

module.exports = nextConfig;
