module.exports = {
  apps: [
    {
      name: 'pwm-api',
      script: './dist/apps/api/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pwm-cdn',
      script: './dist/apps/cdn/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pwm-notifications',
      script: './dist/apps/notifications/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pwm-web',
      script: 'nx',
      args: 'run web:serve:production --port=9030',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pwm-chat',
      script: './dist/apps/chat/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
