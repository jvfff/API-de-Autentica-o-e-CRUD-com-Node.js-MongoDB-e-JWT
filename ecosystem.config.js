module.exports = {
  apps: [{
    name: 'api-auth-crud',
    script: './server.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001
    },

    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    watch: process.env.NODE_ENV !== 'production' ? ['server.js', 'routes', 'models', 'middleware'] : false,
    ignore_watch: ['node_modules', 'logs', 'coverage', 'tests'],
    
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    time: true,
    
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    
    source_map_support: true,
    
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,

    cron_restart: process.env.NODE_ENV === 'production' ? '0 2 * * *' : null,
    
    merge_logs: true,
    
    node_args: process.env.NODE_ENV === 'production' 
      ? ['--max-old-space-size=2048'] 
      : ['--inspect=9229', '--max-old-space-size=1024'],
    
    ...(process.env.NODE_ENV === 'production' && {
      autorestart: true,
      max_memory_restart: '2G',
      instances: 'max'
    })
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:username/api-auth-crud.git',
      path: '/var/www/api-auth-crud',
      'post-deploy': 'npm ci --only=production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:username/api-auth-crud.git',
      path: '/var/www/api-auth-crud-staging',
      'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env staging'
    }
  }
};