import { createSelector, createStructuredSelector } from 'reselect';
import d3 from 'd3';
import map from 'lodash/object/mapValues';
import { uiActiveViewSelector } from './ui';
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

export function graphPointsSelector(state) {
  let activeView = uiActiveViewSelector(state);

  if (activeView != null) {
    let graph = graphSelector(state),
      graphPoints = graph.get('points');

    if (graphPoints != null)
      return graphPoints;
  }

  return placePointsSelector(state);
}

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
      .range(beelineRange)
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