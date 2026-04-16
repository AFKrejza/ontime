import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/trieData': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/stopGroups': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/addStop': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/gateways': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
