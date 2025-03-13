import path from 'path';
import { readFileSync } from 'fs';
import react from '@vitejs/plugin-react';

import { omitBy, template } from 'lodash-es';
import { defineConfig } from 'vite';
import { mdx } from '@cyco130/vite-plugin-mdx';
import config from '@bedrockio/config';

const { SERVER_PORT, ...rest } = config.getAll();

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    strictPort: true,
    allowedHosts: true,
    port: SERVER_PORT,
  },
  // mdx has to go before react
  plugins: [mdx(), react(), env(), partials()],
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

const ENV = omitBy(rest, (_, key) => key.startsWith('SERVER'));
const ENV_REG = /(?:<!-- |{{)env:(\w+)(?: -->|}})/g;

function env() {
  let mode = '';
  return {
    name: 'env-transform',
    configResolved(config) {
      mode = config.mode;
    },
    transformIndexHtml(html) {
      if (mode !== 'development') {
        return html;
      }
      return html.replace(ENV_REG, (all, name) => {
        if (name === 'conf') {
          return `<script>window.__ENV__ = ${JSON.stringify(ENV)};</script>`;
        } else {
          return ENV[name] || '';
        }
      });
    },
  };
}

const PARTIAL_REG = /<!-- require\('(.+)'\) -->/g;

function partials() {
  let mode;
  return {
    name: 'template-injector',
    order: 'pre',
    configResolved(config) {
      mode = config.mode;
    },
    async transformIndexHtml(html) {
      return html.replace(PARTIAL_REG, (_, file) => {
        const p = path.resolve('src', file);
        const t = template(readFileSync(p, 'utf-8'));
        return t({ BUILD: mode === 'production' });
      });
    },
  };
}
