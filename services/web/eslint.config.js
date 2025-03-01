import babelParser from '@babel/eslint-parser';
import { mdx, jest, react, recommended } from '@bedrockio/eslint-plugin';

export default [
  mdx,
  jest,
  react,
  recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
