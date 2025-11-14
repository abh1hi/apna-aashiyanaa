import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './',
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001/test1-50da1/us-central1',
        changeOrigin: true,
            hmr: {
      protocol: 'https',
      host: 'silver-space-broccoli-r47p7p6gg6vp2xp55-5173.app.github.dev',
      port: 443,
    },
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist'
  }
});