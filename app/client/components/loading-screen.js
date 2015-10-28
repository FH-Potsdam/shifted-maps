import React, { Component } from 'react';

class LoadingScreen extends Component {
  /*shouldComponentUpdate(nextProps) {
    return this.props.ui !== nextProps.ui;
  }*/

  render() {
    let { ui } = this.props,
      className = 'loading-screen';

    if (!ui.get('storylineLoaded'))
      className += ' active';

    return (
      <div className={className}>
        <div><em>Places:</em> {ui.get('places')} of {ui.get('placeLimit')}</div>
        <div><em>Trips:</em> {ui.get('trips')}</div>
      </div>
    );
  }
}

export default LoadingScreen;