import { createSelector } from 'reselect';
import reduce from 'lodash/collection/reduce';
import { filteredPlacesSelector } from './places';
import { filteredConnectionsSelector } from './connections';

const mapSelector = state => state.map;

export const mapZoomSelector = createSelector(
  [
    mapSelector
  ],
  map => map.get('zoom')
);

export const mapMapSelector = createSelector(
  [
    mapSelector
  ],
  map => map.get('map')
);

export const mapPointsSelector = createSelector(
  [
    mapMapSelector,
    filteredPlacesSelector,
    mapZoomSelector // Only for caching
  ],
  function(map, places) {
    let points = {};

    places.forEach(function(place, id) {
      points[id] = map.latLngToLayerPoint(place.location);
    });

    return points;
  }
);

export const mapBeelinesSelector = createSelector(
  [
    mapPointsSelector,
    filteredConnectionsSelector
  ],
  function(points, connections) {
    let beelines = {};

    connections.forEach(function(connection, id) {
      let from = points[connection.from],
        to = points[connection.to];

      beelines[id] = from.distanceTo(to);
    });

    return beelines;
  }
);

export const mapBeelinesRangeSelector = createSelector(
  [
    mapBeelinesSelector
  ],
  function(beelines) {
    return reduce(beelines, function(range, beeline) {
      if (beeline < range[0]) range[0] = beeline;
      if (beeline > range[1]) range[1] = beeline;

      return range;
    }, [Infinity, -Infinity]);
  }
);

export default mapSelector;