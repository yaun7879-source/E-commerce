module.exports = {
    apps: [
        {
            name: 'mahasu-backend',
            script: 'backend/server.js',
            cwd: __dirname,
            env: {
                NODE_ENV: 'production',
                PORT: 5001
            },
            instances: 1,
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            error_file: 'logs/err.log',
            out_file: 'logs/out.log',
            log_file: 'logs/combined.log',
            time: true
        }
    ]
};
