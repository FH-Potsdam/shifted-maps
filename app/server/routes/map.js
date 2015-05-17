var express = require('express');

var router = express.Router();

router.use(function (req, res, next) {
  if (!req.user)
    return res.redirect('/auth?redirect=' + req.originalUrl);

  next();
});

router.get('*', function(req, res) {
  res.render('index.nunj');
});

module.exports = router;