const path = require('path');
const withPlugins = require('next-compose-plugins');
/** @type {import('next').NextConfig} */

// module.exports = {
//   reactStrictMode: true,
// };
const withTM = require('next-transpile-modules')([
  // '@blueprintjs/core'
  '@deck.gl/core',
  '@flowmap.gl/layers',
  '@flowmap.gl/data',
]);

module.exports = withPlugins([withTM], {
  reactStrictMode: true,
  distDir: '../.next',
  webpack: (config, options) => {
    // https://github.com/vercel/next.js/issues/25484#issuecomment-865280931
    // config.optimization.splitChunks = false;

    // This is needed so that the packages are recompiled by Next.js when changed
    const resolvePackage = (modulePath) => path.resolve(__dirname, `../${modulePath}/src/index.ts`);
    config.resolve.alias = {
      ...config.resolve.alias,
      '@flowmap.gl/data': resolvePackage('flowmap.gl/packages/data'),
      '@flowmap.gl/layers': resolvePackage('flowmap.gl/packages/layers'),
    };

    return config;
  },
});
