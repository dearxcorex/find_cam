import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize for production and Raspberry Pi
  experimental: {
    // Reduce memory usage
    optimizePackageImports: ['@headlessui/react', 'lucide-react'],
  },

  // Configure images for production
  images: {
    unoptimized: true, // Better for Raspberry Pi performance
  },

  // Compress responses for better performance
  compress: true,

  // Power optimization headers
  poweredByHeader: false,

  // Strict mode for better error handling
  reactStrictMode: true,

  // Enable SWR minification
  swcMinify: true,
};

export default nextConfig;
