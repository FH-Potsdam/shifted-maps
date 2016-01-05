import d3 from 'd3';
import { graphForceSelector, graphPointsSelector, scaledGraphBeelinesSelector } from '../selectors/graph';
import { mapMapSelector } from '../selectors/map';
import { filteredPlacesSelector } from '../selectors/places';
import { filteredConnectionsSelector } from '../selectors/connections';
import { uiActiveViewSelector } from '../selectors/ui';
import Graph from '../components/graph';

export const INIT_POINTS = 'INIT_POINTS';
export const INIT_BEELINES = 'INIT_BEELINES';
export const START_GRAPH = 'START_GRAPH';
export const STOP_GRAPH = 'STOP_GRAPH';
export const RESUME_GRAPH = 'RESUME_GRAPH';
export const TICK_GRAPH = 'TICK_GRAPH';
export const END_GRAPH = 'END_GRAPH';

export function initPoints() {
  return function(dispatch, getState) {
    let state = getState(),
      map = mapMapSelector(state),
      places = filteredPlacesSelector(state);

    dispatch({ type: INIT_POINTS, map, places });
  };
}

export function initBeelines() {
  return function(dispatch, getState) {
    let state = getState(),
      points = graphPointsSelector(state),
      connections = filteredConnectionsSelector(state);

    dispatch({ type: INIT_BEELINES, points, connections });
  };
}

export function startGraph() {
  return function(dispatch, getState) {
    let state = getState(),
      activeView = uiActiveViewSelector(state);

    if (activeView == null)
      return;

    dispatch(stopGraph());

    let places = filteredPlacesSelector(state),
      points = graphPointsSelector(state),
      connections = filteredConnectionsSelector(state),
      beelines = scaledGraphBeelinesSelector(state);

    console.log(beelines);

    let nodes = Graph.computeNodes(places.toArray(), points),
      links = Graph.computeLinks(nodes, connections.toArray(), beelines);

    let force = d3.layout.force();

    force
      .nodes(nodes)
      .links(links)
      .gravity(0)
      .linkDistance(link => link.beeline)
      .chargeDistance(200)
      .on('tick', () => dispatch(tickGraph(force)))
      .on('end', () => dispatch(endGraph(force)));

    force.start();

    dispatch({ type: START_GRAPH, force });
  };
}

export function stopGraph() {
  return function(dispatch, getState) {
    let state = getState(),
      force = graphForceSelector(state);

    if (force == null)
      return;

    force.stop();

    dispatch({ type: STOP_GRAPH, force });
  };
}

export function tickGraph(force) {
  return { type: TICK_GRAPH, force };
}

export function endGraph(force) {
  return { type: END_GRAPH, force };
}