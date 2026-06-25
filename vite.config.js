import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Force output filenames to match what the service worker caches
        entryFileNames: 'app.js',
        assetFileNames: 'styles.css',
      },
    },
  },
});
