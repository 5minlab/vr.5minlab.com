const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const writer = require('express-writer');
const http = require('http');

const port = Number(process.env.PORT || 3001);

app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, 'public')));

const env = {
  production: (process.env.NODE_ENV === 'production') || (process.env.NODE_ENV == 'dist'),
  hostname: require('./config.json').hostname,
};


if('dist' === process.env.NODE_ENV) {
  console.log('use express-writer');
  app.use(writer.watch);
  writer.setWriteDirectory('./output');
}

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

function dumpStaticPage() {
  // Single Page Application으로 만들테니 url 1개만 대응해도 된다
  var options = {
    hostname: 'localhost',
    port: port,
    path: '/',
  };
  function handleResponse(response) {
    response.on('data', function (chunk) {});
    response.on('end', function () {
      console.log('request end');
      // Wrote to >./output/index.html 찍힐때까지 적당히 기다렸다가 죽기
      setTimeout(process.exit, 1000);
    });
  }
  http.request(options, function(response) {
    handleResponse(response);
  }).end();
}
app.listen(port, function () {
  console.log('server running at 0.0.0.0:3001, go refresh and see magic');

  if('dist' === process.env.NODE_ENV) {
    dumpStaticPage();
  }
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
