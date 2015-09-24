import { combineReducers } from 'redux';
import connections from './reducers/connections';
import places from './reducers/places';
import scales from './reducers/scales';
import vis from './reducers/vis';

export default combineReducers({ scales, vis, connections, places });