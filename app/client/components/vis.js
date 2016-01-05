import React, { Component } from 'react';
import range from 'lodash/utility/range';
import { connect } from 'react-redux';
import { vis as visSelector } from '../selector';
import { hoverPlace } from '../actions/ui';
import { updateView } from '../actions/graph';
import Graph from './graph';
import PlaceCircleList from './place-circle-list';
import PlaceClipList from './place-clip-list';

class Vis extends Component {
  render() {
    let { vis, nodes, edges, points, onHoverPlace, onGraphTick } = this.props;

    let { bounds, transform, zoom } = vis,
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

        <Graph nodes={nodes} edges={edges} points={points}
               onHoverPlace={onHoverPlace} onTick={onGraphTick}/>
      </svg>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onHoverPlace: (placeId, hover) => dispatch(hoverPlace(placeId, hover)),
    onGraphTick: (activeView, nodes) => dispatch(updateView(activeView, nodes))
  }
}

export default connect(visSelector, mapDispatchToProps)(Vis);