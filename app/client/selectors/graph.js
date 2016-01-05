import { createSelector, createStructuredSelector } from 'reselect';
import d3 from 'd3';
import map from 'lodash/object/mapValues';
import reduce from 'lodash/collection/reduce';
import { uiActiveViewSelector } from './ui';
import { connectionDistanceDomainSelector, connectionDurationDomainSelector, connectionFrequencyDomainSelector } from './connections';
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
    graphSelector
  ],
  graph => graph.get('points')
);

export const graphBeelinesSelector = createSelector(
  [
    graphSelector
  ],
  graph => graph.get('beelines')
);

export const graphBeelinesRangeSelector = createSelector(
  [
    graphBeelinesSelector
  ],
  function(beelines) {
    return reduce(beelines, function(range, beeline) {
      if (beeline < range[0]) range[0] = beeline;
      if (beeline > range[1]) range[1] = beeline;

      return range;
    }, [Infinity, -Infinity]);
  }
);

const geographicScaleSelector = createSelector(
  [
    connectionDistanceDomainSelector,
    graphBeelinesRangeSelector
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
    graphBeelinesRangeSelector
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
    graphBeelinesRangeSelector
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

export const scaledGraphBeelinesSelector = createSelector(
  [
    graphActiveViewBeelinesScaleSelector,
    graphBeelinesSelector
  ],
  function(beelineScale, beelines) {
    return map(beelines, (beeline) => beelineScale(beeline));
  }
);