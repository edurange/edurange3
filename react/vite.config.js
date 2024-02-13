// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './pages'),
      '@modules': path.resolve(__dirname, './modules'),
      '@public': path.resolve(__dirname, './public'),
      '@assets': path.resolve(__dirname, './assets'),
      '@home': path.resolve(__dirname, './pages/home'),
      '@instructor': path.resolve(__dirname, './pages/instructor'),
      '@scenarios': path.resolve(__dirname, './pages/scenarios'),
      '@chat': path.resolve(__dirname, './pages/chat'),
      '@account': path.resolve(__dirname, './pages/account'),
      '@frame': path.resolve(__dirname, './frame'),
      '@admin': path.resolve(__dirname, './pages/admin'),
      '@config': path.resolve(__dirname, './config'),
      '@notifications': path.resolve(__dirname, './pages/notifications'),
    },
  },
  server: {
    port: 3663
  },
  // ... other options ...
});
