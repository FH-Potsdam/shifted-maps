import React, { Component } from 'react';
import Connection from './connection';

class ConnectionList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.edges !== nextProps.edges;
  }

  render() {
    let connections = [];

    this.props.edges.map(function(edge, id) {
      connections.push(<Connection key={id} edge={edge} />);
    });

    return <g className="connection-list">{connections}</g>;
  }
}

export default ConnectionList;