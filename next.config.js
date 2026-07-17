/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["node:sqlite", "pg"],
  },
};

module.exports = nextConfig;
