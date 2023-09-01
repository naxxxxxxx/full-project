module.exports = {
  apps: [
    {
      name: 'WORK',
      script: './bin/www',
      watch: true,
      instances: 2,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/data/logs/work.233joy.com/out.log',
      error_file: '/data/logs/work.233joy.com/error.log',
      ignore_watch: 'public',
    },
  ],
};
