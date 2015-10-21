import React, { Component } from 'react';

class PlaceLabel extends Component {
  shouldComponentUpdate(nextProps) {
    let node = this.props.node,
      nextNode = nextProps.node;

    return (node.point !== nextNode.point || node.radius !== nextNode.radius || node.strokeWidth !== nextNode.strokeWidth);
  }

  render() {
    let node = this.props.node,
      { x, y } = node.point;

    y += node.radius;

    return (
      <g className="place-label">
        <text x={x} y={y} className="place-label-stroke">{node.name}</text>
        <text x={x} y={y}>{node.name}</text>
      </g>
    );
  }
}

export default PlaceLabel;