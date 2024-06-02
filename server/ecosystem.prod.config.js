const os = require('os');

module.exports = {
  apps: [
    {
      name: 'server-prod',
      script: './server.js',
      instances: os.cpus().length - 1,
      autorestart: true,
      watch: false,
      max_memory_restart: Math.floor(os.totalmem() / 1024 / 1024 / 1024 / 2) + 'G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};