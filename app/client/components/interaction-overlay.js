import React, { Component } from 'react';

class InteractionOverlay extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="interaction-overlay">
        <a className="interaction-overlay__close" onClick={this.props.onClose}>Close Overlay</a>
        <div className="layout layout--large">
          <div className="layout__item u-1-of-3 interaction-overlay__item">
            <img src="/images/interaction-zoom-in.png"/>
            <strong>Zoom in</strong>
            <em>Bring two fingers closer together.</em>
          </div>
          <div className="layout__item u-1-of-3 interaction-overlay__item">
            <img src="/images/interaction-zoom-out.png"/>
            <strong>Zoom out</strong>
            <em>Move two fingers apart.</em>
          </div>
          <div className="layout__item u-1-of-3 interaction-overlay__item">
            <img src="/images/interaction-drag.png"/>
            <strong>Drag</strong>
            <em>Move three fingers on the surface.</em>
          </div>
        </div>
      </div>
    )
  }
}

export default InteractionOverlay;