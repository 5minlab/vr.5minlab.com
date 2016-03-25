const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use('/', express.static(__dirname));

const port = Number(process.env.PORT || 3001);
app.listen(port, function () {
  console.log('server running at 0.0.0.0:3001, go refresh and see magic');
});
