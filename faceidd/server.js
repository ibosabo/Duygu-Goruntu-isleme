const express = require('express');
const app = express();
const path = require('path');

app.get('/', function (req, res) {
res.sendFile(path.join(__dirname + "/index.html"))
});

app.get('/about', function (req, res) {
res.sendFile(path.join(__dirname + "/about.html"))
});

app.use('/assets/js', express.static(path.join(__dirname, 'assets/js'), {
  extensions: ['js'],
  setHeaders: function (res, path, stat) {
    res.set('Content-Type', 'text/javascript')
  }
}));

app.use('/assets/css', express.static(path.join(__dirname, 'assets/css'), {
  extensions: ['css'],
  setHeaders: function (res, path, stat) {
    res.set('Content-Type', 'text/css')
  }
}));

app.listen(3000, function() {
console.log("Server listening on port 3000")
})