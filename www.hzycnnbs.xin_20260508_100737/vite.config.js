import { defineConfig } from 'vite';
import { resolve } from 'path';

// `https://vitejs.dev/config/` 
export default defineConfig({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'static'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'apps/home/views/about.html'),
        projects: resolve(__dirname, 'apps/home/views/projects.html'),
        contact: resolve(__dirname, 'apps/home/views/contact.html'),
        login: resolve(__dirname, 'apps/home/views/login.html'),
        admin: resolve(__dirname, 'apps/admin/views/admin.html'),
        gomoku: resolve(__dirname, 'apps/home/views/gomoku.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  }
});