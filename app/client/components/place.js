import React, { Component } from 'react';
import PlaceMap from './place-map';
import PlaceDeco from './place-deco';
//import PlaceLabel from './place-label';

class Place extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.node.visible !== nextProps.node.visible ||
      (nextProps.node.visible && this.props.node !== nextProps.node);
  }

  render() {
    let { node, onRequestTile } = this.props,
      style = { display: 'none' };

    if (node.visible)
      style.display = 'block';

    return (
      <g style={style} className="place">
        <PlaceMap node={node} onRequestTile={onRequestTile} />
        <PlaceDeco node={node} />
        {/*<PlaceLabel node={node} />*/}
      </g>
    );
  }
}

export default Place;