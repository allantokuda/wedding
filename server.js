var express = require('express')
var path = require('path')
var compression = require('compression')

var app = express()

app.use(compression())

// serve our static stuff like index.css
app.use(express.static(path.join(__dirname, 'public')))

var renderApp = function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
};

// send all requests to index.html so browserHistory in React Router works
app.get('/invitation*', function (req, res) { renderApp(req, res); })
app.get('/event*'     , function (req, res) { renderApp(req, res); })

var PORT = process.env.PORT || 8080
app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT)
})
