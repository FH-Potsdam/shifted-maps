import React, { Component } from 'react';
import PlaceClip from './place-clip';

class PlaceMap extends Component {
  shouldComponentUpdate(nextProps) {
    let { node } = this.props,
      nextNode = nextProps.node;

    return node.radius !== nextNode.radius || node.point !== nextNode.point || node.tile !== nextNode.tile;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.node.tile != null)
      return;

    this.oldTile = this.props.node.tile || this.oldTile;
  }

  render() {
    let { node } = this.props,
      { radius, point } = node,
      tile = node.tile || this.oldTile,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      size = radius * 2;

    let imageProps = {
      x: point.x - radius,
      y: point.y - radius,
      width: size,
      height: size
    };

    if (tile != null) {
      let tileRadius = Math.min(tile.width / 2, tile.height / 2);

      imageProps = {
        x: point.x - tileRadius,
        y: point.y - tileRadius,
        width: tile.width,
        height: tile.height,
        xlinkHref: tile.url
      };
    }

    return (
      <g className="place-map"
         clipPath={clipPath}>
        <rect className="place-map-background" x={point.x - radius} y={point.y - radius} width={size} height={size} />
        <image {...imageProps} />
      </g>
    );
  }
}

export default PlaceMap;