/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [`raw.githubusercontent.com`, "metadata.jito.network"],
  },
  env: {
    RPC_ENDPOINT: process.env.RPC_ENDPOINT,
    DATABASE_SERVER_URL: process.env.DATABASE_SERVER_URL,
    SPOT_GRID_DATABASE_SERVER_URL: process.env.SPOT_GRID_DATABASE_SERVER_URL,
    COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY,
    BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY,
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
