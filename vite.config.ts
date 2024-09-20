import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Targets modern JavaScript features, ensuring support for top-level await
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // Ensures Vite uses ESNext features
    },
  },
});
