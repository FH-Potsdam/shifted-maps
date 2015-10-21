import React, { Component } from 'react';

class PlaceLabel extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.node.radius !== nextProps.node.radius;
  }

  render() {
    let { node } = this.props;

    return (
      <g className="place-label">
        <text x="0" y={node.radius} className="place-label-stroke">{node.name}</text>
        <text x="0" y={node.radius}>{node.name}</text>
      </g>
    );
  }
}

export default PlaceLabel;