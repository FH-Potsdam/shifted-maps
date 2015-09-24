import React, { Component } from 'react';
import PlaceCircle from './place-circle';

class PlaceClip extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    let node = this.props.node;

    return (
      <g>
        <clipPath id={PlaceClip.createId(node)}>
          <use xlinkHref={'#' + PlaceCircle.createId(node)} />
        </clipPath>
      </g>
    );
  }
}

PlaceClip.createId = function(node) {
  return 'place-clip-' + node.id;
};

export default PlaceClip;