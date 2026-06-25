module.exports = {
  apps: [
    {
      name: 'otorent-fe',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/user/webapp/carRent-fe',
      env: { NODE_ENV: 'production' },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
