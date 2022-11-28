const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              'node_modules/wally-sdk/dist/worker.js'
            ),
            to: path.resolve(__dirname, 'public/'),
          },
        ],
      })
    );
    return config;
  },
};

module.exports = nextConfig;
