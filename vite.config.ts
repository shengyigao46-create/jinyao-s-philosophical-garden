import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const kimiAuthHeaders = env.KIMI_API_KEY ? { Authorization: `Bearer ${env.KIMI_API_KEY}` } : {};
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/kimi': {
            target: 'https://api.moonshot.cn',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/kimi/, '/v1/chat/completions'),
            headers: kimiAuthHeaders
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
