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

    y += node.radius + node.strokeWidth / 2;

    return (
      <g className="place-label">
        <text x={x} y={y} textAnchor="middle" className="place-label-stroke">{node.name}</text>
        <text x={x} y={y} textAnchor="middle">{node.name}</text>
      </g>
    );
  }
}

export default PlaceLabel;