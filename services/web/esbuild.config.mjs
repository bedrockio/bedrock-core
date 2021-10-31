import { build } from 'esbuild';
import { lessLoader } from 'esbuild-plugin-less';
import babel from 'esbuild-plugin-babel';
import html from './htmlPlugin.mjs';

(async () => {
  await build({
    // watch: true,
    entryPoints: ['src/index.js'],
    bundle: true,
    // format: 'cjs',
    // minify: true,
    // sourcemap: true,
    // target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    loader: {
      // '.js': 'jsx',
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.md': 'file',
    },
    outdir: 'dist/assets',
    assetNames: '[name]-[hash]',
    entryNames: 'public-[hash]',
    plugins: [
      html({
        template: 'src/index.html',
        outfile: 'dist/index.html',
      }),
      lessLoader(),
      babel({
        filter: RegExp(`${process.cwd()}/src/.*\\.js$`),
        namespace: '',
      }),
    ],
  });
})();
