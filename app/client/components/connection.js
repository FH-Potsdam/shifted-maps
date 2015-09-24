import React, { Component } from 'react';

class Connection extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.edge !== nextProps.edge;
  }

  render() {
    let { edge } = this.props,
      style = { display: 'none' };

    if (edge.visible)
      style.display = 'block';

    return (
      <line style={style}
            x1={edge.fromPoint.get('x')}
            y1={edge.fromPoint.get('y')}
            x2={edge.toPoint.get('x')}
            y2={edge.toPoint.get('y')}
            strokeWidth={edge.strokeWidth}
            className="connection" />
    );
  }
}

export default Connection;