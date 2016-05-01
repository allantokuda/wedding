var express = require('express');
var path = require('path');
var compression = require('compression');
var router = express.Router();
var bodyParser = require('body-parser')
var app = express();
var util = require('util');
var request = require('request');

var PORT              = process.env.PORT || 8080;
var DOMAIN_NAME       = process.env.DOMAIN_NAME || 'yourdomain.com';
var MAIL_DOMAIN_NAME  = process.env.MAIL_DOMAIN_NAME || 'mail.yourdomain.com';
var MAIL_API_KEY      = process.env.MAIL_API_KEY || 'YOUR_MAILGUN_API_KEY';

var MAIL_SERVICE = "https://api.mailgun.net/v3";

app.use(compression());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

var renderApp = function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
};

// send all GET requests to index.html so browserHistory in React Router works
router.get('/event/[-_a-z0-9]*', function (req, res) { renderApp(req, res); });
router.get('/event/[-_a-z0-9]+/[-_a-z0-9]+', function (req, res) { renderApp(req, res); });

router.post('/sendmail', function(req, res) {
  if (!req.body) {
    res.status(400);
    res.json({ error: "JSON body must be provided" });
  }
  if (!util.isArray(req.body.invitations)) {
    res.status(400);
    res.json({ error: "Array of invitations must be provided" });
  }

  var toAddresses = req.body.invitations.map(function(invitation) {
    return invitation.to;
  })

  var recipientVariables = {};
  req.body.invitations.forEach(function(invitation) {
    recipientVariables[invitation.to] = { 'invitationId': invitation.id };
  });

  var emailText = req.body.message1 + "\n\n" +
    "http://" + DOMAIN_NAME + "/event/" + req.body.eventId + "/%recipient.invitationId%" + "\n\n" +
    req.body.message2;

  request.post({url: MAIL_SERVICE + "/" + MAIL_DOMAIN_NAME + "/messages",
    auth: {
      user: "api",
      pass: MAIL_API_KEY
    },
    form: {
      "from": req.body.from || "Invitation <info@" + MAIL_DOMAIN_NAME + ">",
      "to": toAddresses,
      "subject": req.body.subject,
      "text": emailText,
      "recipient-variables": JSON.stringify(recipientVariables)
    }
  }, function (error, response, body) {
    if (error) {
      console.error(error);
    }
    res.send(body);
  });
});

app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT);
})
