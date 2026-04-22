module.exports = {
  apps: [
    {
      name: 'tales-preview',
      script: './backend/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5021,
        BIND_HOST: process.env.BIND_HOST || '127.1.67.5',
        APP_STORAGE_DIR:
          process.env.APP_STORAGE_DIR ||
          '/data01/virt72693/domeenid/www.talesofreval.ee/preview-storage',
        NODE_PATH:
          process.env.NODE_PATH ||
          '/data01/virt72693/domeenid/www.talesofreval.ee/tor-full-stack/node_modules',
        PREVIEW_NOINDEX: process.env.PREVIEW_NOINDEX || 'true',
      },
    },
  ],
};
