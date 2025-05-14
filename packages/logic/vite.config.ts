import { defineConfig } from 'vite';

export default defineConfig({
    test: {
      globals: true,
      environment: 'jsdom' // Si nécessaire pour les tests UI
    }
  });