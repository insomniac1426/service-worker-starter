const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const authMiddleware = require('./src/middlewares/authMiddleware');
const router = require('./src/middlewares/router');

app.use('/static', express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.use('/api', router);

app.use(authMiddleware);

// we do this special thing because we want all our routes to funnel through our service worker 
// for that to happen the !![ sw has to be placed in root directory ]!!
// i.e. need to have root path and not scoped path
app.get('/sw.js', function swHandler(req, res) {
  res.sendFile(path.resolve(__dirname, 'public/js/sw.js'));
});

app.get('/addBlog', function(req, res) {
  if(req.isAuthenticated) {
    const htmlPath = path.resolve(__dirname, 'public/views/addBlog.html');
    res.sendFile(htmlPath); 
  } else {
    res.redirect('/login');
  }
});

app.get('/about', function(req, res) {
  const htmlPath = path.resolve(__dirname, 'public/views/about.html');
  res.sendFile(htmlPath);
});

app.get('/blogs', function(req, res) {
  const htmlPath = path.resolve(__dirname, 'public/views/blogs.html');
  res.sendFile(htmlPath);
});


app.get('/login', function(req, res) {
  const htmlPath = path.resolve(__dirname, 'public/views/login.html');
  res.sendFile(htmlPath);
});

app.get('/', function(req, res) {
  const htmlPath = path.resolve(__dirname, 'public/views/index.html');
  res.sendFile(htmlPath);
});

app.listen('8082', function() {
  console.log("server running on http://localhost:8082 ..");
})