import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 2200,
    //strictPort: true,
  },
  plugins: [react()],

  resolve: {
    alias: {
      helpers: path.resolve(__dirname, './src/helpers'),
      screens: path.resolve(__dirname, './src/screens'),
      contexts: path.resolve(__dirname, './src/contexts'),
      components: path.resolve(__dirname, './src/components'),
      layouts: path.resolve(__dirname, './src/layouts'),
      styles: path.resolve(__dirname, './src/styles'),
      semantic: path.resolve(__dirname, './src/semantic'),
      utils: path.resolve(__dirname, './src/utils'),
      modals: path.resolve(__dirname, './src/modals'),
      assets: path.resolve(__dirname, './src/assets'),
    },
  },

  // All of this is for using .js files as .jsx.
  esbuild: {
    loader: 'jsx',
    include: /.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
