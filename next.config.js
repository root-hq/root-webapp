/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [`raw.githubusercontent.com`, "metadata.jito.network"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    DATABASE_SERVER_URL: process.env.DATABASE_SERVER_URL,
    SPOT_GRID_DATABASE_SERVER_URL: process.env.SPOT_GRID_DATABASE_SERVER_URL,
    RPC_ENDPOINT: process.env.RPC_ENDPOINT,
    WS_ENDPOINT: process.env.WS_ENDPOINT,
    BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY,
    DISABLE_USER_WHITELIST: process.env.DISABLE_USER_WHITELIST,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
