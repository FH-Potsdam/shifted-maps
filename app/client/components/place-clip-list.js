import React, { Component } from 'react';
import PlaceClip from './place-clip';

class PlaceClipList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.nodes !== nextProps.nodes;
  }

  render() {
    let placeClips = [];

    this.props.nodes.forEach(function(node, id) {
      placeClips.push(<PlaceClip key={id} node={node} />);
    });

    return <g className="place-clip-list">{placeClips}</g>;
  }
}

export default PlaceClipList;