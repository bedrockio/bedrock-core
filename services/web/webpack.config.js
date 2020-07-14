// Note:
//
// To enable multiple builds, place each app in
// a folder inside src, add them to "default"
// args below, and move the html template to
// src/common/index.html.

const path = require('path');
const yargs = require('yargs');
const config = require('@bedrockio/config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const argv = yargs.boolean('p').boolean('analyze').option('app', {
  alias: 'a',
  array: true,
  // Add multiple app names here.
  default: [],
}).argv;

const DEV = !argv.p;

if (DEV && argv.analyze) {
  throw new Error('Analyze mode must be used in production. Use yarn build --analyze.');
}

module.exports = {
  devtool: DEV ? 'cheap-module-source-map' : 'source-map',
  entry: getEntryPoints(),
  output: {
    publicPath: '/',
    filename: 'assets/[name].[hash].bundle.js',
    chunkFilename: 'assets/[name].chunk-[hash].bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      '../../theme.config$': path.resolve(path.join(__dirname, 'src'), 'theme/theme.config'),
    },
    extensions: ['.js', '.json', '.jsx'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(css|less)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', ...(DEV ? [] : ['postcss-loader']), 'less-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif|pdf|eot|ttf|woff2?)$/,
        loader: 'file-loader',
        options: {
          esModule: false,
          outputPath: 'assets',
        },
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/[name]-[hash].css',
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    ...getTemplatePlugins(),
    ...getOptionalPlugins(),
    new FaviconsWebpackPlugin({
      logo: './src/assets/icon.svg',
    }),
  ],
};

// koa-webpack -> webpack-hot-client requires this to be wrapped in an array
// https://github.com/webpack-contrib/webpack-hot-client/issues/11
function getEntryPoints() {
  const apps = argv.app;
  const entryPoints = {};
  if (apps.length === 0) {
    entryPoints['public'] = ['./src/index'];
  } else {
    for (let app of apps) {
      entryPoints[app] = [`./src/${app}/index`];
    }
  }
  return entryPoints;
}

function getTemplatePlugins() {
  let apps = argv.app;
  let template;
  if (apps.length > 0) {
    template = 'src/common/index.html';
  } else {
    apps = ['public'];
    template = 'src/index.html';
  }
  return apps.map((app) => {
    return new HtmlWebpackPlugin({
      template,
      chunks: [app, 'vendor'],
      templateParameters: {
        app,
        DEV,
        ...config.getAll(),
      },
      minify: {
        removeComments: false,
        collapseWhitespace: true,
      },
      filename: path.join(app === 'public' ? '' : app, 'index.html'),
      inject: true,
    });
  });
}

function getOptionalPlugins() {
  const plugins = [];
  if (argv.analyze) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    plugins.push(new BundleAnalyzerPlugin());
  }
  return plugins;
}
