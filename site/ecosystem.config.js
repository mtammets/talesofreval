module.exports = {
  apps: [
    {
      name: 'server',
      script: './backend/server.js',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
      },
    },
  ],
};
  
