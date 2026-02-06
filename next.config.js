/** @type {import('next').NextConfig} */

// module.exports = {
//   reactStrictMode: true,
// };
const withTM = require('next-transpile-modules')([
  // '@blueprintjs/core'
  '@deck.gl/core',
]);

module.exports = withTM({
  reactStrictMode: true,
  trailingSlash: true,
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
});
