import React, { Component } from 'react';
// import PlaceMap from './place-map';
import PlaceDeco from './place-deco';
//import PlaceLabel from './place-label';

class PlaceList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.nodes !== nextProps.nodes;
  }

  render() {
    let places = [];

    this.props.nodes.forEach(function(node) {
      let style = { display: 'none' };

      if (node.visible)
        style.display = 'block';

      places.push(
        <g style={style} key={node.place}>
          {/*<PlaceMap node={node} tile={tiles.get(key)} />*/}
          <PlaceDeco node={node} />
          {/*<PlaceLabel node={node} />*/}
        </g>
      );
    });

    return <g className="place-list">{places}</g>;
  }
}

export default PlaceList;