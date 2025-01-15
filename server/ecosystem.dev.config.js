module.exports = {
  apps: [
    {
      name: 'server-dev',
      script: './src/index.js',
      instances: 1,
      autorestart: true,
      watch: true,
      ignore_watch: [
        'node_modules',
        'public',
        'logs',
        '*.log',
        '*.json',
        '../images',
        'seed.js',
      ],
      watch_options: {
        followSymlinks: false,
      },
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
