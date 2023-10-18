/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [`raw.githubusercontent.com`]
    },
    env: {
        RPC_ENDPOINT: process.env.RPC_ENDPOINT,
        DATABASE_SERVER_URL: process.env.DATABASE_SERVER_URL
    }
}

module.exports = nextConfig
