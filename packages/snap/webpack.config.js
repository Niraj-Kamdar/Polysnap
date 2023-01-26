const path = require('path');
const snapsWebpackPlugin = require('@metamask/snaps-webpack-plugin');
const buffer = require('buffer');

const options = {
  /**
   * Whether to strip all comments from the bundle.
   */
  stripComments: false,

  /**
   * Whether to evaluate the bundle with SES, to ensure SES compatibility.
   */
  eval: false,

  /**
   * The path to the Snap manifest file. If set, it will be checked and automatically updated with
   * the bundle's hash, if `writeManifest` is enabled. Defaults to `snap/manifest.json` in the
   * current working directory.
   */
  manifestPath: './snap.manifest.json',

  /**
   * Whether to write the updated Snap manifest file to disk. If `manifestPath` is not set, this
   * option has no effect. If this is disabled, an error will be thrown if the manifest file is
   * invalid.
   */
  writeManifest: true,
};

module.exports = {
  mode: 'none',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // plugins: [new snapsWebpackPlugin.default(options)],
};
