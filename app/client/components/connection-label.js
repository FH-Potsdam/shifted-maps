import React, { Component } from 'react';
import classNames from 'classnames';

class ConnectionLabel extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.edge.label !== nextProps.edge.label;
  }

  render() {
    let { edge } = this.props,
      className = classNames('connection-label', { active: edge.label != null });

    return (
      <g className={className}>
        <text className="connection-label-stroke">{edge.label}</text>
        <text>{edge.label}</text>
      </g>
    );
  }
}

export default ConnectionLabel;