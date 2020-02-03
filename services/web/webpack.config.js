const path = require('path');
const yargs = require('yargs');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const argv = yargs
  .boolean('p')
  .boolean('analyze')
  .option('app', {
    alias: 'a',
    array: true,
    default: ['public', 'admin'],
  })
  .argv;

const DEV = !argv.p;

if (DEV && argv.analyze) {
  throw new Error('Analyze mode must be used in production. Use yarn build --analyze.');
}

function getTemplatePlugins() {
  return argv.app.map(app => {
    return new HtmlWebpackPlugin({
      chunks: [app],
      template: `src/common/index.html`,
      templateParameters: {
        app,
        DEV,
      },
      filename: path.join(app === 'public' ? '' : app, 'index.html')
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

function getEntryPoints() {
  return argv.app.reduce((entryPoints, app) => {
    // koa-webpack -> webpack-hot-client requires this to be wrapped in an array
    // https://github.com/webpack-contrib/webpack-hot-client/issues/11
    entryPoints[app] = [`./src/${app}/index`];
    return entryPoints;
  }, {});
}

module.exports = {
  devtool: DEV ? 'cheap-module-source-map' : 'source-map',
  entry: getEntryPoints(),
  output: {
    publicPath: '/',
    filename: 'assets/[name]-[hash].bundle.js',
    chunkFilename: 'assets/[name]-chunk-[hash].bundle.js',
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    alias: {
      '../../theme.config$': path.resolve('./src/common/theme/theme.config')
    },
    extensions: ['.js', '.json', '.jsx'],
    modules: [path.join(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(css|less)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          ...(DEV ? [] : ['postcss-loader']),
          'less-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg|gif|eot|ttf)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets'
        }
      },
      {
        test: /\.(pdf)$/,
        loader: 'file-loader?name=[name].[ext]&outputPath=downloads/&publicPath=downloads/',
        options: {
          outputPath: 'assets'
        }
      },
      {
        test: /\.woff(2)?(\?v=\d\.\d\.\d)?$/,
        loader: 'url-loader?limit=10000',
        options: {
          outputPath: 'assets'
        }
      },
      {
        test: /\.(md)$/,
        loader: 'raw-loader'
      },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      fetch:
      'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch/dist/fetch.umd'
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name]-[hash].css'
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    ...getTemplatePlugins(),
    ...getOptionalPlugins(),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        sourceMap: !DEV,
        parallel: true,
        terserOptions: {
          output: {
            comments: false
          },
        }
      }),
    ],
  },
  performance: {
    maxAssetSize: 1500000,
    maxEntrypointSize: 1500000
  }
};
