import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import app from './reducer';

//const loggerMiddleware = createLogger();

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware/*, // lets us dispatch() functions
  loggerMiddleware*/ // neat middleware that logs actions
)(createStore);

export default createStoreWithMiddleware(app);