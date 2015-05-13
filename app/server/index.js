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

// @TODO Move to development only
app.use(connectLivereload());

// Static route middleware
app.use(express.static(__dirname + '/../../public'));

function checkAuth(req, res, next) {
  if (!req.user)
    return res.redirect('/auth?redirect=' + req.originalUrl);

  next();
}

// Visualization route middleware
app.use('/map', checkAuth, map);
app.use('/api', checkAuth, api);
app.use('/auth', auth);

app.use(home);

module.exports = app;