import React, { Component } from 'react';

class LoadingScreen extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.stats !== nextProps.stats;
  }

  render() {
    let { stats, active } = this.props,
      className = 'loading-screen';

    if (active)
      className += ' active';

    return (
      <div className={className}>
        <div><em>Places:</em> {stats.totalPlaces} of {stats.placeLimit}</div>
        <div><em>Trips:</em> {stats.totalConnections}</div>
      </div>
    );
  }
}

export default LoadingScreen;