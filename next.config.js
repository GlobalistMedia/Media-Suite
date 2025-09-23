const { i18n } = require("./next-i18next.config.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Disable Terser for server-side builds to avoid AWS SDK issues
    if (isServer) {
      config.optimization.minimize = false;
    }

    return config;
  },
  images: { unoptimized: true },
  i18n,
};

module.exports = nextConfig;
