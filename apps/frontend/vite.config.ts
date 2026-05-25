import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: []
  },
  server: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:4174'
    }
  }
});
