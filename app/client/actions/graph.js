import d3 from 'd3';
import { graphForceSelector, graphPointsSelector, graphBeelinesSelector } from '../selectors/graph';
import { mapMapSelector } from '../selectors/map';
import { clusteredPlacesSelector, placePointsSelector } from '../selectors/places';
import { clusteredConnectionsSelector } from '../selectors/connections';
import { uiActiveViewSelector } from '../selectors/ui';
import Graph from '../components/graph';

export const STORE_POINTS = 'STORE_POINTS';
export const RESTORE_POINTS = 'RESTORE_POINTS';
export const START_GRAPH = 'START_GRAPH';
export const STOP_GRAPH = 'STOP_GRAPH';
export const RESUME_GRAPH = 'RESUME_GRAPH';
export const TICK_GRAPH = 'TICK_GRAPH';
export const END_GRAPH = 'END_GRAPH';
export const MOVE_POINTS = 'MOVE_POINTS';
export const PUT_POINTS = 'PUT_POINTS';

export function startGraph() {
  return function(dispatch, getState) {
    let state = getState(),
      activeView = uiActiveViewSelector(state);

    if (activeView == null)
      return;

    let places = clusteredPlacesSelector(state),
      points = graphPointsSelector(state),
      connections = clusteredConnectionsSelector(state),
      beelines = graphBeelinesSelector(state);

    let nodes = Graph.computeNodes(places.toArray(), points),
      links = Graph.computeLinks(nodes, connections.toArray(), beelines);

    let force = d3.layout.force();

    force
      .nodes(nodes)
      .links(links)
      .gravity(0)
      .friction(0.2)
      .charge(-1000)
      .linkDistance(link => link.beeline)
      .linkStrength(1)
      .on('end', () => dispatch(endGraph(force)));

    force.on('tick', (event) => {
      let { alpha } = event,
        k = alpha * 0.5;

      nodes.forEach(function(node) {
        let x = node.start.x - node.x,
          y = node.start.y - node.y;

        node.x += x * k;
        node.y += y * k;
      });

      dispatch(tickGraph(force));
    });

    force.start();

    dispatch(putPoints());
    dispatch({ type: START_GRAPH, force, points });
  };
}

export function stopGraph() {
  return function(dispatch, getState) {
    let state = getState(),
      force = graphForceSelector(state);

    if (force == null)
      return;

    force.stop();
    dispatch({ type: STOP_GRAPH });

    dispatch(movePoints());
  };
}

export function tickGraph(force) {
  return { type: TICK_GRAPH, force };
}

export function endGraph(force) {
  return { type: END_GRAPH, force };
}

export function movePoints() {
  return { type: MOVE_POINTS };
}

export function putPoints() {
  return { type: PUT_POINTS };
}

export function storePoints() {
  return function(dispatch, getState) {
    let state = getState(),
      force = graphForceSelector(state);

    if (force == null)
      return;

    let map = mapMapSelector(state);

    dispatch({ type: STORE_POINTS, force, map });
  };
}

export function restorePoints() {
  return function(dispatch, getState) {
    let state = getState(),
      map = mapMapSelector(state),
      points = placePointsSelector(state);

    dispatch({ type: RESTORE_POINTS, map, points });
  };
}