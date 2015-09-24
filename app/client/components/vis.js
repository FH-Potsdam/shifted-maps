import React, { Component } from 'react';
import { connect } from 'react-redux';
import selector from '../selector';
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
    let { vis, nodes, edges } = this.props;

    vis = vis.toJS();

    let bounds = vis.bounds,
      transform = vis.transform;

    let viewBox = [bounds.min.x, bounds.min.y, bounds.dimensions.x, bounds.dimensions.y].join(' '),
      transformString = L.DomUtil.getTranslateString(transform.translate),
      style = {};

    if (transform.scale != null)
      transformString += ' scale(' + transform.scale + ')';

    style[L.DomUtil.TRANSFORM] = transformString;

    return (
      <svg className={this.props.className} width={bounds.dimensions.x} height={bounds.dimensions.y} viewBox={viewBox} style={style}>
        <defs>
          <PlaceCircleList nodes={nodes} />
          <PlaceClipList nodes={nodes} />
        </defs>

        <ConnectionList edges={edges} />
        <PlaceList nodes={nodes} />
      </svg>
    );
  }
}

export default connect(selector)(Vis);