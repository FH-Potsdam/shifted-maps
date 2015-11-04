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
    let { node, onHover } = this.props,
      style = { display: 'none' },
      className = 'place';

    if (node.visible)
      style.display = 'block';

    if (node.hover)
      className += ' hover';

    let point = node.point,
      transform = `translate(${point.x}, ${point.y})`;

    return (
      <g style={style}
         transform={transform}
         data-rank={node.rank}
         className={className}
         onMouseEnter={onHover.bind(this, true)}
         onMouseLeave={onHover.bind(this, false)}>
        <PlaceMap node={node} />
        <PlaceDeco node={node} />
        <PlaceLabel node={node} />
      </g>
    );
  }
}

export default Place;