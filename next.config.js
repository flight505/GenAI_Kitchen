/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'upcdn.io',
      'replicate.delivery',
      'uploads.bytescale.com',
      'pbxt.replicate.delivery'
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  poweredByHeader: false,
  staticPageGenerationTimeout: 90,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  }
};

module.exports = nextConfig;
