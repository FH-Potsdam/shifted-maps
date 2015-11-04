import React, { Component } from 'react';
import PlaceClip from './place-clip';

class PlaceMap extends Component {
  shouldComponentUpdate(nextProps) {
    let { node } = this.props,
      nextNode = nextProps.node;

    return node.radius !== nextNode.radius || node.tileURL !== nextNode.tileURL;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.node.tileURL != null)
      return;

    this.oldTileURL = this.props.node.tileURL || this.oldTile;
  }

  render() {
    let { node } = this.props,
      { radius } = node,
      tileURL = node.tileURL || this.oldTileURL,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      size = radius * 2;

    return (
      <g className="place-map"
         clipPath={clipPath}>
        <rect className="place-map-background" x={-radius} y={-radius} width={size} height={size} />
        <image x={-radius} y={-radius} width={size} height={size} xlinkHref={tileURL} />
        <circle className="place-map-dot" r="3" cx="0" cy="0" />
      </g>
    );
  }
}

export default PlaceMap;