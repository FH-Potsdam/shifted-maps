var express = require('express'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  helmet = require('helmet'),
  auth = require('./routes/auth'),
  map = require('./routes/map'),
  api = require('./routes/api'),
  tiles = require('./routes/tiles'),
  home = require('./routes/home'),
  config = require('./config'),
  passport = require('./services/passport'),
  mongoStore = require('./services/mongo-store');

var app = express();

app.set('debug', 'development' == app.get('env'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

app.locals.debug = app.get('debug');
app.locals.compileDebug = false;

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

// Static route middleware
app.use(express.static(__dirname + '/../../public', {
  lastModified: app.get('debug'),
  etag: app.get('debug')
}));

app.use('/map', map);
app.use('/api', api);
app.use('/tiles', tiles);
app.use('/auth', auth);

app.use(home);

app.use(function(err, req, res, next) {
  console.error('Express', err, err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;