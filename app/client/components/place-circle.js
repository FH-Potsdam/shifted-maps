import React, { Component } from 'react';

class PlaceCircle extends Component {
  shouldComponentUpdate(nextProps) {
    let node = this.props.node,
      nextNode = nextProps.node;

    return node.point !== nextNode.point || node.radius !== nextNode.radius;
  }

  render() {
    let node = this.props.node,
      id = PlaceCircle.createId(node);

    return <circle className="place-circle" cx={node.point.x} cy={node.point.y} r={node.radius} id={id} />;
  }
}

PlaceCircle.createId = function(node) {
  return 'place-circle-' + node.place;
};

export default PlaceCircle;