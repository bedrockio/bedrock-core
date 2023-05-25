const path = require('path');

const webpack = require('webpack');
const config = require('@bedrockio/config');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { template: compileTemplate } = require('lodash');

// Note that webpack has deprecated the -p flag and now uses "mode".
// Additionally NODE_ENV seems to affect the build as well.
const BUILD = process.env.NODE_ENV === 'production';

const PARAMS = {
  BUILD,
  ...config.getAll(),
};

module.exports = {
  mode: BUILD ? 'production' : 'development',
  devtool: BUILD ? 'source-map' : 'eval-cheap-module-source-map',
  entry: {
    public: getEntryPoint('./src/index.js'),
  },
  output: {
    publicPath: '/',
    filename: 'assets/[name].[contenthash].js',
    assetModuleFilename: 'assets/[contenthash][ext]',
    clean: true,
  },
  resolve: {
    alias: {
      lodash: 'lodash-es',
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.js', '.json', '.jsx'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    // Node core modules were previously shimmed in webpack < v5.
    // These must now be opted into via the "fallback" option.
    fallback: {
      path: false,
    },
    // Webpack's chooses "browser" first by default which can increase
    // bundle sizes as this is often pre-bundled code.
    mainFields: ['module', 'browser', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        type: 'javascript/auto',
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(css|less)$/,
        use: BUILD
          ? [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              'less-loader',
            ]
          : ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif|mp4|pdf|eot|ttf|woff2?)$/,
        type: 'asset/resource',
      },
      {
        test: /\.md$/,
        type: 'asset/source',
      },
      {
        test: /\.mdx$/,
        loader: '@mdx-js/loader',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
        exclude: path.resolve(__dirname, './src/index.html'),
        options: {
          esModule: false,
          preprocessor: (source, ctx) => {
            try {
              return compileTemplate(source)(PARAMS);
            } catch (err) {
              ctx.emitError(err);
              return source;
            }
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      templateParameters: {
        ...PARAMS,
      },
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: false,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
      inject: true,
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    ...getOptionalPlugins(),

    // Favicons plugin occasionally makes webpack build fail due with error:
    // glib: SVG has no elements
    //
    // This error is intermittent and tracked here:
    // https://github.com/jantimon/favicons-webpack-plugin/issues/200
    new FaviconsWebpackPlugin({
      logo: './src/assets/favicon.svg',

      // Set devMode to "webapp" to test PWA stuff on dev.
      mode: 'webapp',
      devMode: 'light',

      // https://github.com/itgalaxy/favicons#usage
      favicons: {
        appName: '', // Your application's name.
        dir: 'auto', // Primary text direction for name, short_name, and description
        lang: 'en-US', // Primary language for name and short_name
        background: '#fff', // Background colour for flattened icons.
        theme_color: '#fff', // Theme color user for example in Android's task switcher.
        appleStatusBarStyle: 'black-translucent', // Style for Apple status bar: "black-translucent", "default", "black". Not actually black!.
        display: 'fullscreen', // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser".
        orientation: 'portrait', // Default orientation: "any", "natural", "portrait" or "landscape".
        loadManifestWithCredentials: true, // Browsers don't send cookies when fetching a manifest, enable this to fix that.
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          favicons: true,
          windows: true,
          yandex: false,
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, './src/assets/public'),
          to: path.join(__dirname, './dist'),
        },
      ],
    }),
  ],

  optimization: {
    minimizer: [
      (compiler) => {
        new TerserWebpackPlugin({
          terserOptions: {
            // Preventing function and class name mangling
            // for now to allow screen name magic to work.
            keep_fnames: true,
            keep_classnames: true,
          },
        }).apply(compiler);
      },
    ],
  },
  performance: {
    // 10mb limit to warn about insanity happening but as a
    // general rule we do no care about build sizes by default.
    maxAssetSize: 10_000_000,
    maxEntrypointSize: 10_000_000,
  },
  cache: {
    type: 'filesystem',
  },
};

function getEntryPoint(path) {
  const entry = [];
  if (!BUILD) {
    entry.push('webpack-hot-middleware/client');
  }
  entry.push(path);
  return entry;
}

function getOptionalPlugins() {
  const plugins = [];
  if (BUILD) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'assets/[name].[contenthash].css',
      })
    );
  } else {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }
  return plugins;
}
