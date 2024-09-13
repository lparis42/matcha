const os = require('os');

module.exports = {
  apps: [
    {
      name: 'server-prod',
      script: './src/index.js',
      instances: 1, //os.cpus().length,
      autorestart: true,
      watch: true,
      ignore_watch: [
        'node_modules',
        'public',
        'logs',
        '*.log',
        '*.json',
        '../images'
      ],
      watch_options: {
        followSymlinks: false,
      },
      max_memory_restart: '1G', //Math.floor(os.totalmem() / 1024 / 1024 / 1024 / 2) + 'G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};