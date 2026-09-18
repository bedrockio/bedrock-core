import { jest, node, recommended } from '@bedrockio/eslint-plugin';

export default [
  jest,
  recommended,
  node,
  {
    files: ['**/*.test.js', '__mocks__/**/*.js', 'src/utils/testing/**/*.js'],
    languageOptions: {
      globals: { vi: 'readonly' },
    },
  },
];
