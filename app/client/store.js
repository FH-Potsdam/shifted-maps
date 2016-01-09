import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Iterable } from 'immutable';
import { createStore, applyMiddleware } from 'redux';
import app from './reducer';
import { TICK_GRAPH } from './actions/graph';
import { HOVER_PLACE } from './actions/ui';

const loggerMiddleware = createLogger({
  collapsed: true,
  predicate: (getState, action) => action.type != TICK_GRAPH && action.type != HOVER_PLACE,
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

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, // lets us dispatch() functions
  loggerMiddleware // neat middleware that logs actions
)(createStore);

export default createStoreWithMiddleware(app);