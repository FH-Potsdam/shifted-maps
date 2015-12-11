import React, { Component } from 'react';
import range from 'lodash/utility/range';
import { connect } from 'react-redux';
import { vis as visSelector } from '../selector';
import { hoverPlace } from '../actions/ui';
import Graph from './graph';
import PlaceCircleList from './place-circle-list';
import PlaceClipList from './place-clip-list';
import ConnectionList from './connection-list';
import PlaceList from './place-list';

class Vis extends Component {
  render() {
    let { vis, nodes, edges } = this.props;

    let { bounds, transform, zoom, activeView } = vis,
      boundSize = bounds.getSize();

    let { translate, scale } = transform.toJS();

    let viewBox = [bounds.min.x, bounds.min.y, boundSize.x, boundSize.y].join(' '),
      transformString = L.DomUtil.getTranslateString(translate),
      style = {};

    if (scale != null)
      transformString += ' scale(' + scale + ')';

    style[L.DomUtil.TRANSFORM] = transformString;

    let zoomRange = range(zoom).join(' ');

    return (
      <svg className={this.props.className} width={boundSize.x} height={boundSize.y} viewBox={viewBox} style={style}
           data-zoom={zoomRange}>
        <defs>
          <PlaceCircleList nodes={nodes}/>
          <PlaceClipList nodes={nodes}/>
        </defs>

        <Graph activeView={activeView} nodes={nodes} edges={edges}>
          <ConnectionList edges={edges}/>
          <PlaceList nodes={nodes} onHover={this.props.onHoverPlace}/>
        </Graph>
      </svg>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onHoverPlace: (placeId, hover) => dispatch(hoverPlace(placeId, hover))
  }
}

export default connect(visSelector, mapDispatchToProps)(Vis);