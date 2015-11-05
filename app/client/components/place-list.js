import React, { Component } from 'react';
import Place from './place';

class PlaceList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.nodes !== nextProps.nodes;
  }

  render() {
    let places = [],
      { nodes, onHover, animate } = this.props;

    nodes.forEach((node, id) => {
      places.push(<Place node={node} key={id} onHover={onHover.bind(this, id)} animate={animate} />);
    });

    return <g className="place-list">{places}</g>;
  }
}

export default PlaceList;