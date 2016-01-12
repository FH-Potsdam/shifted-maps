import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Iterable } from 'immutable';
import { createStore, applyMiddleware } from 'redux';
import app from './reducer';
import { START_GRAPH } from './actions/graph';

const loggerMiddleware = createLogger({
  collapsed: true,
  predicate: (getState, action) => action.type == START_GRAPH,
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