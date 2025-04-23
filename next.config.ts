import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: ['app-build-manifest.json'], 
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
});


export default nextConfig;
