var React = require('react'),
  ShiftedMaps = require('./components/app'),
  config = require('./config');

L.mapbox.accessToken = config.mapbox.token;

React.render(
  <ShiftedMaps />,
  document.getElementById('app')
);