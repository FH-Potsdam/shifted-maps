import React, { Component } from 'react';
import { connect } from 'react-redux';
import selector from '../selector';
import { fetchTile } from '../actions';
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

  render() {
    let { dispatch, vis, nodes, edges } = this.props;

    let {bounds, transform } = vis,
      boundSize = bounds.getSize();

    let { translate, scale } = transform.toJS();

    let viewBox = [bounds.min.x, bounds.min.y, boundSize.x, boundSize.y].join(' '),
      transformString = L.DomUtil.getTranslateString(translate),
      style = {};

    if (scale != null)
      transformString += ' scale(' + scale + ')';

    style[L.DomUtil.TRANSFORM] = transformString;

    return (
      <svg className={this.props.className} width={boundSize.x} height={boundSize.y} viewBox={viewBox} style={style}>
        <defs>
          <PlaceCircleList nodes={nodes} />
          <PlaceClipList nodes={nodes} />
        </defs>

        <ConnectionList edges={edges} />
        <PlaceList nodes={nodes} onRequestTile={(node) => dispatch(fetchTile(node))} />
      </svg>
    );
  }
}

export default connect(selector)(Vis);