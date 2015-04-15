var app = require('./app/server/index'),
  chalk = require('chalk');

// Server initialization
var server = app.listen(3000, function () {
  // @TODO Only needed in development. Moves this to the gulp configuration.
  var port = server.address().port;

  console.log(chalk.grey('Express app listening on %s ...'), port);
});