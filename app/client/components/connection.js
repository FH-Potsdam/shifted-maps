import React, { Component } from 'react';
import ConnectionLabel from './connection-label';

class Connection extends Component {
  shouldComponentUpdate(nextProps) {
    let { edge } = this.props,
      nextEdge = nextProps.edge;

    return edge.fromPoint !== nextEdge.toPoint || edge.strokeWidth !== nextEdge.strokeWidth;
  }

  render() {
    let { edge } = this.props,
      style = { display: 'none' };

    if (edge.visible)
      style.display = 'block';

    return (
      <g className="connection" style={style} data-rank={edge.rank}>
        <line x1={edge.fromPoint.get('x')}
              y1={edge.fromPoint.get('y')}
              x2={edge.toPoint.get('x')}
              y2={edge.toPoint.get('y')}
              strokeWidth={edge.strokeWidth}
              className="connection-line" />
        <ConnectionLabel edge={edge} />
      </g>
    );
  }
}

export default Connection;