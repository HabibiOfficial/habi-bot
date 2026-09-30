module.exports = {
  apps: [
    {
      name: 'habi-bot',
      script: 'index.js',
      cwd: '/home/deploy/apps/habi-bot',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      max_memory_restart: '700M',
      time: true,
      merge_logs: true,
      // WA-Relay tetap live: bot harus selalu punya sesi
      env: {
        NODE_ENV: 'production',
        // Bot WA = proses yang tidak boleh mati diam-diam
        PAIRING_NUMBER: process.env.PAIRING_NUMBER || '',
        HABI_API_URL: 'https://api.habibicloudserver.dpdns.org',
        HABI_API_TIMEOUT_MS: '90000',
        HABI_YTDLP_PATH: '/home/deploy/bin/yt-dlp',
        HABI_YTDLP_TIMEOUT_MS: '120000',
        YTDLP_PATH: '/home/deploy/bin/yt-dlp',
      },
    },
  ],
}
