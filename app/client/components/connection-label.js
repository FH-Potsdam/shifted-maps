import React, { Component } from 'react';

class ConnectionLabel extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.edge.label !== nextProps.edge.label;
  }

  render() {
    let { edge } = this.props;

    if (edge.label == null)
      return null;

    return (
      <g className="connection-label">
        <text className="connection-label-stroke">{edge.label}</text>
        <text>{edge.label}</text>
      </g>
    );
  }
}

export default ConnectionLabel;