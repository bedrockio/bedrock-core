const babelParser = require('@babel/eslint-parser');
const {
  mdx,
  jest,
  react,
  recommended,
  webpackImports,
} = require('@bedrockio/eslint-plugin');

module.exports = [
  mdx,
  jest,
  react,
  recommended,
  webpackImports,
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
