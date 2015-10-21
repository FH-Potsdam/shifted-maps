import React, { Component } from 'react';

class PlaceCircle extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.radius !== nextProps.node.radius;
  }

  render() {
    let node = this.props.node,
      id = PlaceCircle.createId(node);

    return <circle className="place-circle" cx="0" cy="0" r={node.radius} id={id} />;
  }
}

PlaceCircle.createId = function(node) {
  return 'place-circle-' + node.id;
};

export default PlaceCircle;