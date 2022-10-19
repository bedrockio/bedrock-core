const path = require('path');

module.exports = {
  env: {
    node: true,
    browser: true,
  },
  settings: {
    jest: { version: 26 },
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
    babelOptions: {
      configFile: path.join(__dirname, 'babel.config.js'),
    },
  },
  extends: [
    'plugin:bedrock/recommended',
    'plugin:bedrock/react',
    'plugin:bedrock/jest',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  globals: {
    __ENV__: 'readonly',
  },
};
