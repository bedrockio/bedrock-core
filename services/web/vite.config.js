import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [react()],
  root: 'src',
  resolve: {
    alias: {
      assets: './assets',
      utils: './utils',
      stores: './stores',
      semantic: './semantic',
      helpers: './helpers',
      screens: './screens',
      components: './components',
      layouts: './layouts',
      modals: './modals',
      docs: './docs',
    },
  },
});
