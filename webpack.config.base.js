const path = require('path');
const webpack = require('webpack');

const NODE_ENV = process.env.NODE_ENV;

const env = {
  production: NODE_ENV === 'production',
  staging: NODE_ENV === 'staging',
  test: NODE_ENV === 'test',
  development: (NODE_ENV === 'development' || typeof NODE_ENV === 'undefined'),
};

Object.assign(env, {
  build: (env.production || env.staging),
});


module.exports = {
  devtool: 'eval',
  entry: {
    vendor: [
      'es6-promise',
      'three',
      'three/examples/js/controls/VRControls',
      // VREffect.js handles stereo camera setup and rendering.
      'three/examples/js/effects/VREffect',
    ],
    index: ['./src/index.js'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:3000/dist/',
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, loaders: ['style', 'css'] },
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      /* chunkName= */'vendor',
      /* filename= */'vendor.bundle.js'
    ),
    new webpack.DefinePlugin({
      __DEV__: env.development,
      __STAGING__: env.staging,
      __PRODUCTION__: env.production,
      __CURRENT_ENV__: '\'' + (NODE_ENV) + '\'',
    }),
    new webpack.ProvidePlugin({
      THREE: 'three',
    }),
  ],
  external: {
    three: 'THREE',
  },
};
