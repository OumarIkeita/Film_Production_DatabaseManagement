const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    domains: [],
  },
  experimental: {
    // 1. Allow the Dev Origin
    allowedDevOrigins: ["http://172.16.0.2:3000", "http://localhost:3000"],

    // 2. Also allow it for Server Actions (often solves persistent warnings)
    serverActions: {
      allowedOrigins: ["172.16.0.2:3000", "localhost:3000"],
    },
  },
};

module.exports = nextConfig;
