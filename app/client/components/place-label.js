import React, { Component } from 'react';

class PlaceLabel extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.node.radius !== nextProps.node.radius;
  }

  render() {
    let { node } = this.props,
      label = [];

    node.name.split("\n").forEach(function(part, index) {
      label.push(<tspan key={index} x="0" dy={index > 0 ? '1.3em' : null} className={index > 0 ? 'place-label-more' : null}>{part}</tspan>)
    });

    return (
      <g className="place-label">
        <text x="0" y={node.radius} className="place-label-stroke">{label}</text>
        <text x="0" y={node.radius}>{label}</text>
      </g>
    );
  }
}

export default PlaceLabel;