module.exports = {
  apps: [
    {
      name: 'carrent-fe',
      cwd: '/home/user/webapp/carRent-fe',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      env: { NODE_ENV: 'development' },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
