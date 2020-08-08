// Note:
//
// To enable multiple builds, place each app in
// a folder inside src, add them to "default"
// args below, and move the html template to
// src/common/index.html.

const path = require('path');
const yargs = require('yargs');
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

const ENV = require('./env');

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
        test: /\.(png|jpg|svg|gif|mp4|pdf|eot|ttf|woff2?)$/,
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
      {
        test: /\.html$/i,
        exclude: /index\.html$/,
        loader: path.resolve('./src/utils/loaders/templateParams'),
        options: {
          // Expose template params used in partials included with
          // require('path/to/template.html') in the same way as the
          // main template.
          params: ENV,
        }
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

    // Favicons plugin occasionally makes webpack build fail due with error:
    // glib: SVG has no elements
    //
    // This error is intermittent and tracked here:
    // https://github.com/jantimon/favicons-webpack-plugin/issues/200
    new FaviconsWebpackPlugin({
      logo: './src/assets/icon.svg',

      // Enable this line to test PWA stuff on dev.
      // devMode: 'webapp',

      // https://github.com/itgalaxy/favicons#usage
      favicons: {
        appName: '',                              // Your application's name.
        dir: 'auto',                              // Primary text direction for name, short_name, and description
        lang: 'en-US',                            // Primary language for name and short_name
        background: '#fff',                       // Background colour for flattened icons.
        theme_color: '#fff',                      // Theme color user for example in Android's task switcher.
        appleStatusBarStyle: 'black-translucent', // Style for Apple status bar: "black-translucent", "default", "black". Not actually black!.
        display: 'fullscreen',                    // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser".
        orientation: 'portrait',                  // Default orientation: "any", "natural", "portrait" or "landscape".
        loadManifestWithCredentials: true,        // Browsers don't send cookies when fetching a manifest, enable this to fix that.
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          windows: true,
          yandex: false,
        }
      },
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
        ...ENV,
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
