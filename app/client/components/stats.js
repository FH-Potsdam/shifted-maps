import React, { Component } from 'react';
import { GEOGRAPHIC_VIEW, DURATION_VIEW, FREQUENCY_VIEW } from '../models/views';
import { formatDistance, formatDuration, formatFrequency } from '../services/views';

class Stats extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.stats !== nextProps.stats || this.props.activeView !== nextProps.activeView;
  }

  render() {
    let { stats, activeView } = this.props,
      children = [];

    if (activeView === GEOGRAPHIC_VIEW) {
      children.push(
        <dt key="total-distance">Travel Distance:</dt>,
        <dd key="total-connection-distance">{formatDistance(stats.totalConnectionDistance)}</dd>,
        <dt key="average-distance">Avg. Distance:</dt>,
        <dd key="average-connection-distance">{formatDistance(stats.averageConnectionDistance)}</dd>
      );
    } else if (activeView === DURATION_VIEW) {
      children.push(
        <dt key="total-duration">Travel Duration:</dt>,
        <dd key="total-connection-duration">{formatDuration(stats.totalConnectionDuration)}</dd>,
        <dt key="average-duration">Avg. Duration:</dt>,
        <dd key="average-connection-duration">{formatDuration(stats.averageConnectionDuration)}</dd>
      );
    } else if (activeView === FREQUENCY_VIEW) {
      children.push(
        <dt key="total-frequency">Travel Frequency:</dt>,
        <dd key="total-connection-frequency">{formatFrequency(stats.totalConnectionFrequency)}</dd>,
        <dt key="average-frequency">Avg. Frequency:</dt>,
        <dd key="average-connection-frequency">{formatFrequency(stats.averageConnectionFrequency)}</dd>
      );
    } else {
      children.push(
        <dt key="places">Places:</dt>,
        <dd key="total-places">{stats.totalPlaces}</dd>,
        <dt key="connections">Connections:</dt>,
        <dd key="total-connections">{stats.totalConnections}</dd>
      );
    }

    return (
      <dl className="ui__stats">
        {children}
      </dl>
    );
  }
}

export default Stats;