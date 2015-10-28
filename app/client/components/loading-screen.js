import React, { Component } from 'react';

class LoadingScreen extends Component {
  /*shouldComponentUpdate(nextProps) {
    return this.props.ui !== nextProps.ui;
  }*/

  render() {
    let { ui } = this.props,
      className = 'loading-screen';

    if (!ui.get('authorized'))
      return null;

    if (!ui.get('storylineLoaded'))
      className += ' active';

    return (
      <div className={className}>
        {/*<div><strong>Places:</strong> {places.size} of {ui.get('place_limit')}</div>
        <div><strong>Trips:</strong> {trips.size}</div>
        <div><strong>Visits:</strong> {stays.size}</div>*/}
      </div>
    );
  }
}

export default LoadingScreen;