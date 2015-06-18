var express = require('express');

var router = express.Router();

// Main route
router.get('/', function(req, res) {
  res.render('home.nunj');
});

/*router.get('/', function(req, res) {
  res.render('index.nunj');
});*/

module.exports = router;