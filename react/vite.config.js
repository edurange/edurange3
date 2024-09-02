import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './pages'),
            '@public': path.resolve(__dirname, './public'),
            '@assets': path.resolve(__dirname, './assets'),
            '@modules': path.resolve(__dirname, './modules'),
            '@pub': path.resolve(__dirname, './pages/pub'),
            '@staff': path.resolve(__dirname, './pages/staff'),
            '@student': path.resolve(__dirname, './pages/student'),
            '@frame': path.resolve(__dirname, './frame'),
            '@config': path.resolve(__dirname, './config'),
            '@components': path.resolve(__dirname, './components'),
        },
    },
    server: {
        port: 3663
    },
    build: {
        terserOptions: {
            compress: {
                drop_console: true,
            },
            parallel: true,
        }
    },
    // ... other option objects here ...
});