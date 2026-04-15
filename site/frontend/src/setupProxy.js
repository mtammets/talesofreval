const { createProxyMiddleware } = require('http-proxy-middleware');

const apiPaths = ['/email', '/api', '/uploads'];

module.exports = function setupProxy(app) {
  apiPaths.forEach((path) => {
    app.use(
      path,
      createProxyMiddleware({
        target: 'http://localhost:5020',
        changeOrigin: true,
      })
    );
  });
};
