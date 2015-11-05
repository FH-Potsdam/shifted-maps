import React, { Component } from 'react';
import Connection from './connection';

class ConnectionList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.edges !== nextProps.edges;
  }

  render() {
    let connections = [],
      { edges, animate } = this.props;

    edges.forEach((edge, id) => {
      connections.push(<Connection key={id} edge={edge} animate={animate} />);
    });

    return <g className="connection-list">{connections}</g>;
  }
}

export default ConnectionList;