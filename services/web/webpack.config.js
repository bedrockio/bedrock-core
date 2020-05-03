const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
  filename: '[name]-[hash].css'
});

const isProduction = process.argv.indexOf('-p') >= 0;
const ENV = isProduction ? 'production' : 'development';

const plugins = [
  new webpack.DefinePlugin({
    ENV: JSON.stringify(ENV),
    'process.env': {
      // For react building https://facebook.github.io/react/docs/optimizing-performance.html#use-the-production-build
      NODE_ENV: JSON.stringify(ENV)
    }
  }),
  new HtmlWebpackPlugin({
    chunks: ['vendor', 'app'],
    template: 'src/index.html',
    filename: 'index.html'
  }),
  extractLess
];

module.exports = {
  devtool: isProduction ? 'source-maps' : 'cheap-module-source-map',
  entry: {
    app: ['./src/index']
  },
  output: {
    publicPath: '/',
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].chunk-[hash].bundle.js',
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    alias: {
      '../../theme.config$': path.resolve(
        path.join(__dirname, 'src'),
        'theme/theme.config'
      )
    },
    extensions: ['.js', '.json', '.jsx'],
    modules: [path.join(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['react-hot-loader/babel'],
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-proposal-object-rest-spread'],
              ['babel-plugin-mobx-deep-action'],
              ['babel-plugin-styled-components']
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.less|\.css$/,
        use: extractLess.extract({
          fallback: {
            loader: 'style-loader'
          },
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.(eot|png|jpg|ttf|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(pdf)$/,
        loader:
          'file-loader?name=[name].[ext]&outputPath=downloads/&publicPath=downloads/'
      },
      {
        test: /\.woff(2)?(\?v=\d\.\d\.\d)?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff'
      },
      {
        test: /\.(md)$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins
};
