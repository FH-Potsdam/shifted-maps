var express = require('express'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  connectLivereload = require('connect-livereload'),
  helmet = require('helmet'),
  templating = require('./nunjucks-env'),
  auth = require('./routes/auth'),
  map = require('./routes/map'),
  api = require('./routes/api'),
  home = require('./routes/home'),
  config = require('./config'),
  passport = require('./services/passport'),
  mongoStore = require('./services/mongo-store');

var app = express();

console.log(app.get('env'));

app.set('debug', app.get('env') == 'development');

// Templating
templating.express(app);

// Server middlewares
app.use(helmet());
app.use(cookieParser());
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  store: mongoStore
}));

// Auth middlewares
app.use(passport.initialize());
app.use(passport.session());

if (app.get('debug'))
  app.use(connectLivereload());

// Static route middleware
app.use(express.static(__dirname + '/../../public', {
  lastModified: app.get('debug'),
  etag: app.get('debug')
}));

app.use('/map', map);
app.use('/api', api);
app.use('/auth', auth);

app.use(home);

app.use(function(err, req, res, next) {
  console.error('Express', err, err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;