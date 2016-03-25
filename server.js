const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use('/', express.static(__dirname));

const env = {
  production: process.env.NODE_ENV === 'production',
  hostname: require('./config.json').hostname,
};

if (env.production) {
  Object.assign(env, {
    assets: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets.json'))),
  });
  app.use('/dist', express.static(__dirname + '/dist'));
}

app.get('/', function(req, res) {
  const config = require('./webvr.config.js');
  res.render('index', {
    env,
    WebVRConfig: config,
  });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, function () {
  console.log('server running at 0.0.0.0:3001, go refresh and see magic');
});

if(env.production === false) {
  const webpack = require('webpack');
  const WebpackDevServer = require('webpack-dev-server');

  const webpackDevConfig = require('./webpack.config.dev');

  new WebpackDevServer(webpack(webpackDevConfig), {
    publicPath: '/dist/',
    contentBase: './dist/',
    inline: true,
    hot: true,
    stats: false,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': `http://${env.hostname}:3001`,
      'Access-Control-Allow-Headers': 'X-Requested-With',
    },
  }).listen(3000, '0.0.0.0', function (err) {
    if (err) {
      console.log(err);
    }
    console.log('webpack dev server listening on 0.0.0.0:3000');
  });
}
