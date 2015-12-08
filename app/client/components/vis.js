import React, { Component } from 'react';
import range from 'lodash/utility/range';
import { connect } from 'react-redux';
import { vis } from '../selector';
import { hoverPlace } from '../actions/ui';
import PlaceCircleList from './place-circle-list';
import PlaceClipList from './place-clip-list';
import ConnectionList from './connection-list';
import PlaceList from './place-list';

class Vis extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.vis !== nextProps.vis ||
      this.props.nodes !== nextProps.nodes ||
      this.props.edges !== nextProps.edges;
  }

  onHover(placeId, hover) {
    let { dispatch } = this.props;

    dispatch(hoverPlace(placeId, hover));
  }

  render() {
    let { vis, nodes, edges } = this.props;

    let {bounds, transform, zoom } = vis,
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
      <svg className={this.props.className} width={boundSize.x} height={boundSize.y} viewBox={viewBox} style={style} data-zoom={zoomRange}>
        <defs>
          <PlaceCircleList nodes={nodes} />
          <PlaceClipList nodes={nodes} />
        </defs>

        <ConnectionList edges={edges} />
        <PlaceList nodes={nodes} onHover={this.onHover.bind(this)} />
      </svg>
    );
  }
}

export default connect(vis)(Vis);