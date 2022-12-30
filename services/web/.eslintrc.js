const path = require('path');

module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
    babelOptions: {
      configFile: path.join(__dirname, '.babelrc'),
    },
  },
  extends: [
    'plugin:bedrock/recommended',
    'plugin:bedrock/react',
    'plugin:bedrock/jest',
  ],
  overrides: [
    {
      files: '*.js',
      extends: ['plugin:bedrock/imports'],
    },
    {
      files: '*.mdx',
      extends: ['plugin:mdx/recommended'],
      rules: {
        semi: 0,
        'no-unused-expressions': 0,
      },
      settings: {
        'mdx/code-blocks': true,
      },
    },
  ],
  globals: {
    __ENV__: 'readonly',
  },
};
