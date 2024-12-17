/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  distDir: '.next',
  // Explicitly set the pages directory
  dir: 'src',
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    return config;
  },
}

module.exports = nextConfig