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
});
