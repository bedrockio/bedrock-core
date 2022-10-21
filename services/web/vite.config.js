import dns from 'dns';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import babel from 'vite-plugin-babel';

dns.setDefaultResultOrder('verbatim');

export default function ({ mode }) {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // https://vitejs.dev/config/
  return defineConfig({
    root: 'src',
    // plugins: [react()],
    server: {
      // host: 'http://localhost',
      port: 2200,
    },
    build: {
      outDir: '../dist',
    },
  });
}
