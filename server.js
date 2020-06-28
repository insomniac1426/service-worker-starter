const express = require('express');
const path = require('path');

const app = express();

app.use('/static', express.static('public'))

// we do this sspecial thing because we want all our routes to funnel through our service worker 
// for that to happen the !![ sw has to be placed in root directory ]!!
// i.e. need to have root path and not scoped path
app.get('/sw.js', function swHandler(req, res) {
  res.sendFile(path.resolve(__dirname, 'public/js/sw.js'));
});

app.get('/', function(req, res) {
  const htmlPath = path.resolve(__dirname, 'public/index.html');
  res.sendFile(htmlPath);
});

app.listen('8082', function() {
  console.log("server running on http://localhost:8082 ..");
})