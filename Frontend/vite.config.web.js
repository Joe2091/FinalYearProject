import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true }), compression()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist-web', // <-- new output directory for web
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // main app entry
    },
  },
});
