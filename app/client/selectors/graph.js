import { createSelector, createStructuredSelector } from 'reselect';
import d3 from 'd3';
import map from 'lodash/object/mapValues';
import { uiActiveViewSelector } from './ui';
import { mapZoomSelector } from './map';
import { placePointsSelector } from './places';
import { connectionDistanceDomainSelector, connectionDurationDomainSelector, connectionFrequencyDomainSelector, connectionBeelinesSelector, connectionBeelinesRangeSelector, clusteredConnectionsSelector } from './connections';
import { GEOGRAPHIC_VIEW, DURATION_VIEW, FREQUENCY_VIEW } from '../services/views';

export default function graphSelector(state) {
  return state.graph;
}

export const graphViewsSelector = createSelector(
  [
    graphSelector
  ],
  graph => graph.get('views')
);

export const graphForceSelector = createSelector(
  [
    graphSelector
  ],
  graph => graph.get('force')
);

export const graphPointsSelector = createSelector(
  [
    uiActiveViewSelector,
    placePointsSelector,
    graphSelector
  ],
  (activeView, placePoints, graph) => {
    const graphPoints = graph.get('points');

    // If no view is active or graph has no points yet, use place points.
    if (activeView == null || graphPoints == null) {
      // Simple add start property to place points (simple reference)
      return map(placePoints, point => {
        point.start = point;
        return point;
      });
    }

    // Add start property from place points
    return map(graphPoints, (point, id) => {
      point.start = placePoints[id];
      return point;
    });
  }
);

export const graphTransitionSelector = createSelector(
  [
    graphSelector
  ],
  graph => graph.get('transition')
);

const geographicScaleSelector = createSelector(
  [
    connectionDistanceDomainSelector,
    connectionBeelinesRangeSelector
  ],
  function(connectionDistanceDomain, beelineRange) {
    return d3.scale.linear()
      .domain(connectionDistanceDomain)
      .range(beelineRange)
      .clamp(true);
  }
);

const durationScaleSelector = createSelector(
  [
    connectionDurationDomainSelector,
    connectionBeelinesRangeSelector
  ],
  function(connectionDurationDomain, beelineRange) {
    return d3.scale.linear()
      .domain(connectionDurationDomain)
      .range(beelineRange)
      .clamp(true);
  }
);

const frequencyScaleSelector = createSelector(
  [
    connectionFrequencyDomainSelector,
    connectionBeelinesRangeSelector
  ],
  function(connectionFrequencyDomain, beelineRange) {
    return d3.scale.linear()
      .domain([...connectionFrequencyDomain].reverse())
      .range([beelineRange[0], beelineRange[1]])
      .clamp(true);
  }
);

const BEELINE_SCALE_SELECTOR = {
  [GEOGRAPHIC_VIEW]: geographicScaleSelector,
  [DURATION_VIEW]: durationScaleSelector,
  [FREQUENCY_VIEW]: frequencyScaleSelector
};

const graphActiveViewBeelinesScaleSelector = state => {
  let activeView = uiActiveViewSelector(state);

  if (activeView == null)
    return null;

  return BEELINE_SCALE_SELECTOR[activeView](state);
};

export const graphBeelinesSelector = createSelector(
  [
    graphActiveViewBeelinesScaleSelector,
    clusteredConnectionsSelector,
    connectionBeelinesSelector,
    uiActiveViewSelector
  ],
  function(beelineScale, connections, beelines, activeView) {
    let field = 'distance';

    if (activeView === DURATION_VIEW)
      field = 'duration';
    else if (activeView === FREQUENCY_VIEW)
      field = 'frequency';

    return map(beelines, (beeline, id) => {
      let connection = connections.get(id);

      return beelineScale(connection[field]);
    });
  }
);