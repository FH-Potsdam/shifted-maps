import React, { Component } from 'react';
import PlaceCircle from './place-circle';

class PlaceCircleList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.nodes !== nextProps.nodes;
  }

  render() {
    let placeCircles = [];

    this.props.nodes.forEach(function (node) {
      placeCircles.push(<PlaceCircle key={node.place} node={node}/>);
    });

    return <g className="place-circle-list">{placeCircles}</g>;
  }
}

export default PlaceCircleList;