import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import debounce from 'mout/function/debounce';
import ShiftedMaps from './components/app';
import { mapbox } from './config';
import store from './store';

L.mapbox.accessToken = mapbox.token;

// Fix for apples magic trackpad:
let oldOnWheelScroll = debounce(L.Map.ScrollWheelZoom.prototype._onWheelScroll, 20, true);

L.Map.ScrollWheelZoom.prototype._onWheelScroll = function(event) {
  event.preventDefault();
  oldOnWheelScroll.apply(this, arguments);
};

ReactDOM.render(
  <Provider store={store}>
    <ShiftedMaps />
  </Provider>,
  document.getElementById('app')
);