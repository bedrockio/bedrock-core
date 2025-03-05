import { mdx, jest, react, recommended } from '@bedrockio/eslint-plugin';

export default [
  mdx,
  jest,
  react,
  recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
