/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Disabled for dynamic server deployment
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
