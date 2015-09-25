import React, { Component } from 'react';
import Place from './place';

class PlaceList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.nodes !== nextProps.nodes;
  }

  render() {
    let places = [],
      { nodes, onRequestTile } = this.props;

    nodes.forEach(function(node, id) {
      places.push(<Place node={node} key={id} onRequestTile={onRequestTile} />);
    });

    return <g className="place-list">{places}</g>;
  }
}

export default PlaceList;