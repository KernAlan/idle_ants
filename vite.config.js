import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    open: true,
    port: 5173,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Don't treat assets as public dir since we load them as modules
  publicDir: false,
  // Handle file serving for development
  optimizeDeps: {
    exclude: ['src/**/*.js'] // Don't pre-bundle our source files
  }
}); 