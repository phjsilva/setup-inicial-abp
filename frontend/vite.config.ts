import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      host: env.DEV_HOST ?? 'localhost',
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: env.DEV_USE_POLLING === 'true',
        interval: 300,
      },
    },
  };
});
