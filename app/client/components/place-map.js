import React, { Component } from 'react';
import PlaceClip from './place-clip';

class PlaceMap extends Component {
  componentDidMount() {
    this.requestTile();
  }

  componentDidUpdate() {
    this.requestTile();
  }

  requestTile() {
    let { node, onRequestTile } = this.props;

    if (node.visible && node.tile == null)
      onRequestTile(node);
  }

  render() {
    let { node } = this.props,
      { radius, tile, point } = node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      size = radius * 2,
      image = null;

    if (tile != null) {
      image = <image x={point.x - tile.radius} y={point.y - tile.radius} width={tile.size} height={tile.size} xlinkHref={tile.src} />;
    }

    return (
      <g className="place-map" clipPath={clipPath}>
        <rect className="place-map-background" x={point.x - radius} y={point.y - radius} width={size} height={size} />
        {image}
      </g>
    );
  }
}

export default PlaceMap;