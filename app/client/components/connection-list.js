import React, { Component } from 'react';
import { is } from 'immutable';
import Connection from './connection';

class ConnectionList extends Component {
  shouldComponentUpdate(nextProps) {
    return !is(this.props.edges, nextProps.edges);
  }

  render() {
    let connections = [],
      { edges } = this.props;

    edges.forEach((edge, id) => {
      connections.push(<Connection key={id} edge={edge} />);
    });

    return <g className="connection-list">{connections}</g>;
  }
}

export default ConnectionList;