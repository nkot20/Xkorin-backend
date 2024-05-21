module.exports = {
    apps: [{
        name: 'xkorin',
        script: './bin/www',
        node_args: '-r dotenv/config',
        autorestart: true,
        watch: false,
        env: {
            NODE_ENV: 'development',
            LD_LIBRARY_PATH: '/usr/lib/x86_64-linux-gnu/:$LD_LIBRARY_PATH'
        },
        env_production: {
            NODE_ENV: 'production',
            LD_LIBRARY_PATH: '/usr/lib/x86_64-linux-gnu/:$LD_LIBRARY_PATH'
        },

    }],
};
  