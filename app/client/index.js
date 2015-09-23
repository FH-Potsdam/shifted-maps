import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ShiftedMaps from './components/app';
import { mapbox } from './config';
import store from './redux/store';

L.mapbox.accessToken = mapbox.token;

ReactDOM.render(
  <Provider store={store}>
    <ShiftedMaps />
  </Provider>,
  document.getElementById('app')
);