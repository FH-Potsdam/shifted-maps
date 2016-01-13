import thunkMiddleware from 'redux-thunk';
import { Iterable } from 'immutable';
import { createStore, applyMiddleware } from 'redux';
import app from './reducer';

let middlewares = [
  thunkMiddleware
];

/*if (DEBUG) {
  let loggerMiddleware = require('redux-logger')({
    collapsed: true,
    stateTransformer: (state) => {
      let newState = {};

      for (var i of Object.keys(state)) {
        if (Iterable.isIterable(state[i])) {
          newState[i] = state[i].toJS();
        } else {
          newState[i] = state[i];
        }
      }

      return newState;
    }
  });

  middlewares.push(loggerMiddleware);
}*/

const createStoreWithMiddleware = applyMiddleware.apply(undefined, middlewares)(createStore);

export default createStoreWithMiddleware(app);