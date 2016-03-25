const webpack = require('webpack');
const config = require('./webpack.config.base.js');
const hostname = require('./config.json').hostname;

if (process.env.NODE_ENV !== 'test') {
  /*
  config.entry = [
    `webpack-dev-server/client?http://${hostname}:3000`,
    'webpack/hot/dev-server'
  ].concat(config.entry);
  */
}

config.devtool = 'cheap-eval-source-map';

config.devServer = {
  contentBase: './dist',
};

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

module.exports = config;
