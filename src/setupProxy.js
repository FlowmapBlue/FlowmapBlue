const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/spreadsheets', {
    target: 'https://docs.google.com',
    changeOrigin: true,
  }));
};
