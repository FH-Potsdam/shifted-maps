import { combineReducers } from 'redux';
import connections from './reducers/connections';
import places from './reducers/places';
import scales from './reducers/scales';
import vis from './reducers/vis';
import tiles from './reducers/tiles';
import map from './reducers/map';
import ui from './reducers/ui';

export default combineReducers({ scales, vis, ui, map, places, connections, tiles });