import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob: file:; media-src 'self' file:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' file:;",
    },
  },
});
