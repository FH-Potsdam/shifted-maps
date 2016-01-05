import { combineReducers } from 'redux';
import connections from './reducers/connections';
import places from './reducers/places';
import scales from './reducers/scales';
import graph from './reducers/graph';
import vis from './reducers/vis';
import map from './reducers/map';
import ui from './reducers/ui';

export default combineReducers({ scales, vis, ui, map, places, connections, graph });