var express = require('express');

var router = express.Router();

// Main route
router.get('/', function(req, res) {
  res.render('home', { exhibition: req.query.exhibition != null });
});

module.exports = router;