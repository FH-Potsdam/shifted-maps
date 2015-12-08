import React, { Component } from 'react';
import classNames from 'classnames';
import ConnectionLabel from './connection-label';

class Connection extends Component {
  shouldComponentUpdate(nextProps) {
    let { edge } = this.props,
      nextEdge = nextProps.edge;

    return edge.visible !== nextEdge.visible ||
      edge.fromPoint !== nextEdge.fromPoint ||
      edge.toPoint !== nextEdge.toPoint ||
      edge.strokeWidth !== nextEdge.strokeWidth;
  }

  render() {
    let { edge } = this.props,
      { visible, fromPoint, toPoint, strokeWidth, rank } = edge;

    let coordinates = {
      'data-x1': fromPoint.get('x'),
      'data-y1': fromPoint.get('y'),
      'data-x2': toPoint.get('x'),
      'data-y2': toPoint.get('y')
    };

    let className = classNames('connection', { active: visible });

    return (
      <g className={className} data-rank={rank}>
        <line strokeWidth={strokeWidth} className="connection-line" {...coordinates} />
        <ConnectionLabel edge={edge} />
      </g>
    );
  }
}

export default Connection;