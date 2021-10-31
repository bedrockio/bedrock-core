import { build } from 'esbuild';
import { lessLoader } from 'esbuild-plugin-less';
import babel from 'esbuild-plugin-babel';
import html from './htmlPlugin.mjs';

const BUILD = process.env.NODE_ENV === 'production';

(async () => {
  await build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: BUILD,
    sourcemap: !BUILD,
    watch: !BUILD,
    keepNames: true,
    // target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    loader: {
      // '.js': 'jsx',
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.md': 'text',
    },
    outdir: 'dist',
    assetNames: 'assets/[name].[hash]',
    entryNames: 'assets/public.[hash]',
    publicPath: '/',
    plugins: [
      html({
        template: 'src/index.html',
      }),
      lessLoader(),
      babel({
        filter: RegExp(`${process.cwd()}/src/.*\\.js$`),
        namespace: '',
      }),
    ],
  });
})();
