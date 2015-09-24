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
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            strokeWidth={edge.strokeWidth}
            className="connection" />
    );
  }
}

export default Connection;