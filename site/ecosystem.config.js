module.exports = {
  apps: [
    {
      name: 'tor-full',
      script: './backend/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 5020,
        APP_STORAGE_DIR:
          process.env.APP_STORAGE_DIR ||
          '/data01/virt72693/domeenid/www.talesofreval.ee/app-storage',
        NODE_PATH:
          process.env.NODE_PATH ||
          '/data01/virt72693/domeenid/www.talesofreval.ee/tor-full-stack/node_modules',
      },
    },
  ],
};
  
