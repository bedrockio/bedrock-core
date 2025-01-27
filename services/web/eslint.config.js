const babelParser = require('@babel/eslint-parser');
const {
  mdx,
  jest,
  react,
  recommended,
  webpackImports,
} = require('@bedrockio/eslint-plugin');

module.exports = [
  recommended,
  jest,
  mdx,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
        },
      },
    },
    plugins: {
      ...react.plugins,
      ...webpackImports.plugins,
    },
    settings: {
      ...react.settings,
      ...webpackImports.settings,
    },
    rules: {
      ...react.rules,
      ...webpackImports.rules,
    },
  },
];
