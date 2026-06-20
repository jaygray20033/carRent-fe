module.exports = {
  apps: [
    {
      name: 'carrent-fe',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/user/webapp/carRent-fe',
      env: {
        NODE_ENV: 'development',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
