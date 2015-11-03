import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';

class LoadingScreen extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.stats !== nextProps.stats || this.props.active !== nextProps.active;
  }

  render() {
    let { stats } = this.props;

    let width = stats.totalPlaces / stats.placeLimit * 100,
      trainStyle = { width: width + '%' },
      placeLabel = stats.totalPlaces == 1 ? 'Place' : 'Places',
      connectionLabel = stats.totalConnections == 1 ? 'Connection' : 'Connections';

    let timeSpanStart = stats.timeSpan[0];

    let progress = _.range(0, width).join(' ');

    return (
      <div className="loading-screen">
        <div className="loading-screen__hero">
          <h1>Shifted Maps</h1>
          <p className="lede">Loading the last 200 places you visited …</p>
        </div>

        <img className="loading-screen__spinner" src="/images/spinner.png"/>

        <div className="loading-screen__track">
          <div className="loading-screen__train" style={trainStyle} data-progress={progress}>
            <div className="loading-screen__train__start">
              <strong>{moment(timeSpanStart).format('dddd')}</strong>
              <em>{moment(timeSpanStart).format('D. MMM YYYY')}</em>
            </div>
            <ul className="loading-screen__train__stats">
              <li><strong>{stats.totalPlaces}</strong> <em>{placeLabel}</em></li>
              <li><strong>{stats.totalConnections}</strong> <em>{connectionLabel}</em></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default LoadingScreen;