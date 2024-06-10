module.exports = {
    apps: [
      {
        name: 'server-dev',
        script: './src/index.js',
        instances: 1,
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'development',
        },
      },
    ],
  };