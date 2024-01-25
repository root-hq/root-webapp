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
  },
};

module.exports = nextConfig;
