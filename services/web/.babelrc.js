const BUILD = process.env.NODE_ENV === 'production';

module.exports = {
  presets: [['@babel/preset-env'], ['@babel/preset-react']],
  plugins: [
    ['lodash'],
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties'],
    ['react-refresh/babel'],
  ],
};
