var React = require('react'),
  ShiftedMaps = require('./components/app'),
  { mapbox } = require('./config');

L.mapbox.accessToken = mapbox.token;

React.render(
  <ShiftedMaps />,
  document.getElementById('app')
);