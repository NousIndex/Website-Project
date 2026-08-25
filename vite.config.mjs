import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // The app was built with Create React App, so its env vars are named
  // REACT_APP_*. Keeping that prefix means the existing Vercel project
  // settings keep working -- new variables can use either prefix.
  envPrefix: ['VITE_', 'REACT_APP_'],

  server: {
    port: 25565,
    open: false,
  },

  preview: {
    port: 25565,
  },

  build: {
    // Same folder CRA used, so deploy config and .gitignore stay valid.
    outDir: 'build',
    sourcemap: false,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}', 'api/**/*.{test,spec}.js'],
  },
});
