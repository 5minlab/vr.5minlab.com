const webpack = require('webpack');
const config = require('./webpack.config.base.js');

const SaveAssetsJson = require('assets-webpack-plugin');

config.bail = true;
config.debug = false;
config.profile = false;
config.devtool = '#source-map';

const hostname = require('./config').hostname;
config.output.publicPath = '/dist/';

config.plugins = [
  new webpack.optimize.OccurenceOrderPlugin(true),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false,
    },
    compressor: {
      warnings: false,
      screw_ie8: true,
    },
  }),
  new SaveAssetsJson({
    path: process.cwd(),
    prettyPrint: true,
    filename: 'assets.json',
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
].concat(config.plugins);

module.exports = config;
