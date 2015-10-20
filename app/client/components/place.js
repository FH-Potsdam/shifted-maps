import React, { Component } from 'react';
import PlaceMap from './place-map';
import PlaceDeco from './place-deco';
import PlaceLabel from './place-label';

class Place extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.node.visible !== nextProps.node.visible ||
      (nextProps.node.visible && this.props.node !== nextProps.node);
  }

  render() {
    let { node, onRequestTile, onHover } = this.props,
      style = { display: 'none' },
      className = 'place';

    if (node.visible)
      style.display = 'block';

    if (node.hover)
      className += ' hover';

    return (
      <g style={style} className={className} onMouseEnter={onHover.bind(this, true)} onMouseLeave={onHover.bind(this, false)}>
        <PlaceMap node={node} onRequestTile={onRequestTile} />
        <PlaceDeco node={node} />
        <PlaceLabel node={node} />
      </g>
    );
  }
}

export default Place;