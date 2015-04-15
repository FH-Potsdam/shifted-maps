var nunjucks = require('nunjucks');

var e = nunjucks.configure(__dirname + '/templates', {
  autoescape: true
});

module.exports = e;