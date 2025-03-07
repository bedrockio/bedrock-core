import path from 'path';

import react from '@vitejs/plugin-react';
import { mdx } from '@cyco130/vite-plugin-mdx';
import { defineConfig } from 'vite';

import config from '@bedrockio/config';

import { omitBy } from 'lodash-es';

const PUBLIC = omitBy(
  config.getAll(),
  (_, key) => key.startsWith('SERVER') || key.startsWith('HTTP'),
);

const ENV_REG = /(?:<!-- |{{)env:(\w+)(?: -->|}})/g;

const htmlPlugin = () => {
  let mode = '';
  return {
    name: 'html-transform',
    configResolved(config) {
      mode = config.mode;
    },
    transformIndexHtml(html) {
      if (mode !== 'development') {
        return html;
      }
      return html.replace(ENV_REG, (all, name) => {
        if (name === 'conf') {
          return `<script>window.__ENV__ = ${JSON.stringify(PUBLIC)};</script>`;
        } else {
          return PUBLIC[name] || '';
        }
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 2200,
    strictPort: true,
    allowedHosts: true,
  },
  // mdx has to go before react
  plugins: [mdx(), react(), htmlPlugin()],
  envPrefix: 'PUBLIC',

  resolve: {
    alias: {
      helpers: path.resolve(__dirname, './src/helpers'),
      screens: path.resolve(__dirname, './src/screens'),
      stores: path.resolve(__dirname, './src/stores'),
      components: path.resolve(__dirname, './src/components'),
      layouts: path.resolve(__dirname, './src/layouts'),
      styles: path.resolve(__dirname, './src/styles'),
      semantic: path.resolve(__dirname, './src/semantic'),
      utils: path.resolve(__dirname, './src/utils'),
      modals: path.resolve(__dirname, './src/modals'),
      assets: path.resolve(__dirname, './src/assets'),
      docs: path.resolve(__dirname, './src/docs'),
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
