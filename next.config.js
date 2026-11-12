/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  // Bundle CommonJS consumers of the patched ESM-only d3-color release.
  bundlePagesRouterDependencies: true,
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: ['@deck.gl/core'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Allows origin for Mapbox
          },
        ],
      },
    ];
  },
};
