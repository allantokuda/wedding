var express = require('express')
var path = require('path')
var compression = require('compression')
var router = express.Router();
var app = express()

app.use(compression())

// serve our static stuff like index.css
app.use(express.static(path.join(__dirname, 'public')))

var renderApp = function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
};

// send all GET requests to index.html so browserHistory in React Router works
router.get('/event/[-_a-z0-9]*', function (req, res) { renderApp(req, res); })
router.get('/event/[-_a-z0-9]+/[-_a-z0-9]+', function (req, res) { renderApp(req, res); })

router.post('/event/:eventId/sendall', function(req, res) {
  res.send('Sending all invitations for event ID ' + req.params.eventId);
});

app.use('/', router);

var PORT = process.env.PORT || 8080
app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT)
})
