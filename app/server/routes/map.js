var express = require('express'),
  moment = require('moment'),
  Api = require('../services/moves/api'),
  JSONStream = require('../services/api/json-stream'),
  geocode = require('../services/geocode');

var router = express.Router();

router.get('/', function(req, res) {
  var api = new Api(req.user.accessToken),
    firstDate = moment(req.user.firstDate),
    stream = new JSONStream();

  res.header("Content-Type", "text/plain; charset=utf-8");
  stream.pipe(res);

  function fetchSegments() {
    api.daily('/user/storyline', firstDate.format('YYYY-MM'))
      .node('!.*.segments.*', function(segment) {
        stream.write(segment);
      })
      .done(function() {
        firstDate.add(1, 'M');
        fetchSegments();
      })
      .fail(function(error) {
        console.log(error);
        stream.end();
      });
  }

  fetchSegments();
});

router.get('/test', function(req, res) {
  res.render('obeo-test.nunj');
});

router.get('/geocode', function(req, res) {
  geocode({ latitude: 52.520007, longitude: 13.404954 }, function(error, response, body) {
    res.send(body);
  });
});

module.exports = router;