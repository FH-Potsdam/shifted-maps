import { List, Map, Set } from 'immutable';
import d3 from 'd3';
import { createSelector } from 'reselect';
import Node from '../models/node';
import { nodeStrokeWidthRangeScaleSelector, nodeRadiusRangeScaleSelector } from './scales';
import placesSelector from './places';
import { visBoundsSelector, visScaleSelector, visViewSelector } from './vis';

function calcDist(nodeOne, nodeTwo) {
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

function nodeStrokeWidthRange(nodeStrokeWidthRangeScale, visScale) {
  return nodeStrokeWidthRangeScale(visScale);
}

function nodeRadiusRange(nodeRadiusRangeScale, visScale) {
  return nodeRadiusRangeScale(visScale);
}

function nodeStrokeWidthDomain(places) {
  let minFrequency = Infinity,
    maxFrequency = -Infinity;

  places.forEach(function(place) {
    let frequency = place.trips.size;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
  });

  return [minFrequency, maxFrequency];
}

function nodeRadiusDomain(places) {
  let minDuration = Infinity,
    maxDuration = -Infinity;

  places.forEach(function(place) {
    let duration = place.duration;

    minDuration = Math.min(minDuration, duration);
    maxDuration = Math.max(maxDuration, duration);
  });

  return [minDuration, maxDuration];
}

function nodeStrokeWidthScale(nodeStrokeWidthRange, nodeStrokeWidthDomain) {
  return d3.scale.pow().exponent(.5)
    .range(nodeStrokeWidthRange)
    .domain(nodeStrokeWidthDomain);
}

function nodeRadiusScale(nodeRadiusRange, nodeRadiusDomain) {
  return d3.scale.pow().exponent(.5)
    .range(nodeRadiusRange)
    .domain(nodeRadiusDomain);
}

function nodes(places, nodeStrokeWidthScale, nodeRadiusScale, visView, visBounds) {
  let nodes = List()
    .withMutations(function (nodes) {
      places.forEach(function (place, id) {
        let point = visView(place);

        nodes.push(new Node({
          place: id,
          radius: nodeRadiusScale(place.duration),
          strokeWidth: nodeStrokeWidthScale(place.stays.size),
          point
        }));
      });
    })
    .sortBy(function(node) {
      return node.radius;
    });

  // Check for top most nodes, all others will be hidden.
  let topMost = Set().withMutations(function(topMost) {
    let nodes = nodes.toJS();

    for (var i = nodes.length - 1; i >= 0; i--) {
      var nodeOne = nodes[i];

      if (nodeOne.calculated)
        continue;

      nodeOne.calculated = true;

      for (var i = 0; i < nodes.length; i++) {
        var nodeTwo = nodes[i];

        if (nodeTwo.calculated)
          continue;

        if (calcDist(nodeOne, nodeTwo) < (nodeOne.radius - nodeTwo.radius)) {
          nodeTwo.calculated = true;
        }
      }

      topMost.add(nodeOne.place);
    }
  });

  return nodes
    .map(function(node) {
      return node.set('visible', visBounds.contains(node.point) && topMost.includes(node.place));
    });
}

export const nodeStrokeWidthRangeSelector = createSelector(
  nodeStrokeWidthRangeScaleSelector,
  visScaleSelector,
  nodeStrokeWidthRange
);

export const nodeRadiusRangeSelector = createSelector(
  nodeRadiusRangeScaleSelector,
  visScaleSelector,
  nodeRadiusRange
);

export const nodeStrokeWidthDomainSelector = createSelector(
  placesSelector,
  nodeStrokeWidthDomain
);

export const nodeRadiusDomainSelector = createSelector(
  placesSelector,
  nodeRadiusDomain
);

export const nodeStrokeWidthScaleSelector = createSelector(
  nodeStrokeWidthRangeSelector,
  nodeStrokeWidthDomainSelector,
  nodeStrokeWidthScale
);

export const nodeRadiusScaleSelector = createSelector(
  nodeRadiusRangeSelector,
  nodeRadiusDomainSelector,
  nodeStrokeWidthScale
);

export default createSelector(
  placesSelector,
  nodeStrokeWidthScaleSelector,
  nodeRadiusScaleSelector,
  visViewSelector,
  visBoundsSelector,
  nodes
);