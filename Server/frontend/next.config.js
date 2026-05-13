const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    domains: [],
  },
  experimental: {
    // Ensure @ alias works across all Next.js versions
  },
}

module.exports = nextConfig
