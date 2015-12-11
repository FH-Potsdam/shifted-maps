import d3 from 'd3';
import { Seq } from 'immutable';
import { createSelector } from 'reselect';
import { placeStrokeWidthRangeScaleSelector, placeRadiusRangeScaleSelector, placeMinimizeRadiusSelector } from './scales';
import { /*visBoundsSelector, */visScaleSelector } from './vis';
//import { mapMapSelector } from './map';
import { uiTimeSpanSelector, uiHoveredPlaceIdSelector, uiHoverSelector } from './ui';
//import { activeViewSelector } from './views';

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

  let strokeWidthScale = d3.scale.pow().exponent(.5)
    .range(strokeWidthRange)
    .domain(strokeWidthDomain);

  let radiusScale = d3.scale.pow().exponent(.5)
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

/*function positionPlaces(places, mapMap, activeView) {
  return places.map(function(place) {
    let { location, visible } = place,
      point;

    if (!visible)
      return place;

    if (activeView != null && activeView.has(place.id)) {
      point = activeView.get(place.id);
    } else {
      point = mapMap.latLngToLayerPoint(location);
    }

    return place.set('point', point);
  });
}*/

/*function computeDistance(nodeOne, nodeTwo) {
  let nodeOnePoint = nodeOne.point,
    nodeTwoPoint = nodeTwo.point;

  return Math.sqrt(Math.pow(nodeTwoPoint.x - nodeOnePoint.x, 2) + Math.pow(nodeTwoPoint.y - nodeOnePoint.y, 2));
}

function clusterPlaces(places) {
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

        if (computeDistance(placeOne, placeTwo) < (placeOne.radius - placeTwo.radius)) {
          placeTwo.calculated = true;

          places.setIn([placeTwo.id, 'visible'], false);
        }
      }

      places.setIn([placeOne.id, 'visible'], true);
    }
  });
}

function boundPlaces(places, visBounds) {
  return places.map(function(place) {
    let { visible, point } = place;

    if (!visible)
      return place;

    return place.set('visible', visBounds.contains(point));
  });
}*/

function tilePlaces(places) {
  return places.map(function(place) {
    let { location, radius, visible } = place;

    if (!visible)
      return place;

    return place.set('tileURL', `/tiles/${location.lng},${location.lat},${radius}.png${L.Browser.retina ? '@2x' : ''}`);
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

/*export const positionedPlacesSelector = createSelector(
  [
    scaledPlacesSelector,
    mapMapSelector,
    activeViewSelector
  ],
  positionPlaces
);

export const clusteredPlacesSelector = createSelector(
  [
    positionedPlacesSelector
  ],
  clusterPlaces
);

export const boundedPlacesSelector = createSelector(
  [
    clusteredPlacesSelector,
    visBoundsSelector
  ],
  boundPlaces
);*/

export const tiledPlacesSelector = createSelector(
  [
    scaledPlacesSelector//boundedPlacesSelector
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