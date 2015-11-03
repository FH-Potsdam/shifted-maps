import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import debounce from 'mout/function/debounce';
import ShiftedMaps from './components/app';
import { mapbox, exhibition } from './config';
import store from './store';

L.mapbox.accessToken = mapbox.token;

// Fix for apples magic trackpad:
let oldOnWheelScroll = debounce(L.Map.ScrollWheelZoom.prototype._onWheelScroll, 20, true);

L.Map.ScrollWheelZoom.prototype._onWheelScroll = function(event) {
  event.stopPropagation();
  event.preventDefault();

  oldOnWheelScroll.apply(this, arguments);
};

// Prevent zooming the whole page via pinch when not on the map
window.addEventListener('wheel', function() {
  event.preventDefault()
});

if (ENV.exhibition) {
  let logout = debounce(function() {
    window.location.href = '/auth/logout?redirect=/?exhibition';
  }, exhibition.timeout);

  document.addEventListener('mousemove', logout);
  logout();
}

ReactDOM.render(
  <Provider store={store}>
    <ShiftedMaps />
  </Provider>,
  document.getElementById('app')
);