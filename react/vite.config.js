// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './pages'), // Alias '@' to your new source folder
    },
  },
  server: {
    port: 3663
  },
  // ... other configurations ...
});
