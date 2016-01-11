import d3 from 'd3';
import { Seq } from 'immutable';
import { createSelector } from 'reselect';
import { placeStrokeWidthRangeScaleSelector, placeRadiusRangeScaleSelector, placeMinimizeRadiusSelector } from './scales';
import { visScaleSelector } from './vis';
import { mapMapSelector, mapZoomSelector } from './map';
import { uiTimeSpanSelector, uiHoveredPlaceIdSelector, uiHoverSelector, uiClusterStrength } from './ui';

function filterPlaces(places, uiTimeSpan) {
  if (places.size === 0)
    return places;

  let [ start, end ] = uiTimeSpan;

  return places.map(function(place) {
      let stays = place.stays.filter(function(stay) {
        return stay.startAt >= start && stay.endAt <= end;
      });

      let duration = stays.reduce((duration, stay) => duration + stay.duration, 0);

      return place.merge({
        stays: stays,
        duration: duration,
        frequency: stays.size,
        visible: duration > 0
      });
    });
}

function computePlaceScales(places, strokeWidthRangeScale, radiusRangeScale, visScale) {
  let strokeWidthScale = d3.scale.pow().exponent(.5),
    radiusScale = d3.scale.pow().exponent(.5);

  if (places.size === 0)
    return { strokeWidthScale, radiusScale };

  let strokeWidthRange = strokeWidthRangeScale(visScale),
    radiusRange = radiusRangeScale(visScale);

  let minFrequency = Infinity,
    maxFrequency = -Infinity,
    minDuration = Infinity,
    maxDuration = -Infinity;

  places.forEach(function(place) {
    let { frequency, duration, visible } = place;

    if (!visible)
      return;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
    minDuration = Math.min(minDuration, duration);
    maxDuration = Math.max(maxDuration, duration);
  });

  let strokeWidthDomain = [minFrequency, maxFrequency],
    radiusDomain = [minDuration, maxDuration];

  strokeWidthScale
    .range(strokeWidthRange)
    .domain(strokeWidthDomain);

  radiusScale
    .range(radiusRange)
    .domain(radiusDomain);

  return { strokeWidthScale, radiusScale };
}

function scalePlaces(places, strokeWidthScale, radiusScale) {
  let rankScale = radiusScale.copy()
    .exponent(.1)
    .range([1, 10]);

  return places
    .map(function(place) {
      let { frequency, duration, visible } = place;

      if (!visible)
        return place;

      return place.merge({
        strokeWidth: strokeWidthScale(frequency),
        radius: radiusScale(duration),
        rank: Math.round(rankScale(duration))
      });
    })
    .toOrderedMap()
    .sortBy(function(place) {
      return place.radius;
    });
}

function computeDistance(pointOne, pointTwo) {
  return Math.sqrt(Math.pow(pointTwo.x - pointOne.x, 2) + Math.pow(pointTwo.y - pointOne.y, 2));
}

function clusterPlaces(places, points, clusterStrength) {
  // Check for top most nodes, all others will be hidden.
  return places.withMutations(function(places) {
    let placesArray = places.toList().toJS();

    for (var i = placesArray.length - 1; i >= 0; i--) {
      var placeOne = placesArray[i];

      if (!placeOne.visible || placeOne.calculated)
        continue;

      placeOne.calculated = true;

      for (var i = 0; i < placesArray.length; i++) {
        var placeTwo = placesArray[i];

        if (!placeTwo.visible || placeTwo.calculated)
          continue;

        let pointOne = points[placeOne.id],
          pointTwo = points[placeTwo.id];

        let distance = computeDistance(pointOne, pointTwo),
          overlap = placeOne.radius + placeTwo.radius - distance; // Place One Radius always larger than of Place Two

        if (overlap / (placeTwo.radius * 2) >= clusterStrength) {
          placeTwo.calculated = true;

          places.setIn([placeTwo.id, 'visible'], false);
          placeOne.cluster.push(placeTwo.id);
        }
      }

      places.mergeDeepIn([placeOne.id], {
        visible: true,
        cluster: placeOne.cluster
      });
    }
  });
}

function tilePlaces(places) {
  return places.map(function(place) {
    if (!place.visible)
      return place;

    let { cluster, id, radius } = place;

    radius = Math.ceil(radius);

    let locations = cluster.push(id).toArray().map(function(id) {
      let { location } = places.get(id);

      return `${location.lng},${location.lat}`;
    });

    return place.set('tileURL', `/tiles/${locations.join(';')}/${radius}.png${L.Browser.retina ? '@2x' : ''}`);
  });
}

function hoverPlaces(places, uiHoveredPlaceId, uiHover) {
  return places
    .map(function(place) {
      return place.set('hover', uiHover && uiHoveredPlaceId === place.id);
    })
    .sort(function(placeOne, placeTwo) {
      if (placeOne.hover !== placeTwo.hover) {
        if (placeOne.hover) return 1;
        else return -1;
      }

      return 0;
    });
}

const placesSelector = state => state.places;

export const filteredPlacesSelector = createSelector(
  [
    placesSelector,
    uiTimeSpanSelector
  ],
  filterPlaces
);

export const placeScalesSelector = createSelector(
  [
    filteredPlacesSelector,
    placeStrokeWidthRangeScaleSelector,
    placeRadiusRangeScaleSelector,
    visScaleSelector
  ],
  computePlaceScales
);

export const placeStrokeWidthScaleSelector = createSelector(
  [
    placeScalesSelector
  ],
  (state) => state.strokeWidthScale
);

export const placeRadiusScaleSelector = createSelector(
  [
    placeScalesSelector
  ],
  (state) => state.radiusScale
);

export const scaledPlacesSelector = createSelector(
  [
    filteredPlacesSelector,
    placeStrokeWidthScaleSelector,
    placeRadiusScaleSelector
  ],
  scalePlaces
);

export const placePointsSelector = createSelector(
  [
    mapMapSelector,
    placesSelector,
    mapZoomSelector // Only for caching (new zoom = new points)
  ],
  function(map, places) {
    let points = {};

    places.forEach(function(place, id) {
      points[id] = map.latLngToLayerPoint(place.location);
    });

    return points;
  }
);

export const clusteredPlacesSelector = createSelector(
  [
    scaledPlacesSelector,
    placePointsSelector,
    uiClusterStrength
  ],
  clusterPlaces
);

export const tiledPlacesSelector = createSelector(
  [
    clusteredPlacesSelector
  ],
  tilePlaces
);

export const hoveredPlacesSelector = createSelector(
  [
    tiledPlacesSelector,
    uiHoveredPlaceIdSelector,
    uiHoverSelector
  ],
  hoverPlaces
);

export default placesSelector;