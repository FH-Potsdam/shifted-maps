import React, { Component } from 'react';
import d3 from 'd3';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import ConnectionLabel from './connection-label';

class Connection extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.edge !== nextProps.edge;
  }

  componentDidMount() {
    this.appendData();
  }

  componentDidUpdate() {
    this.appendData();
  }

  appendData() {
    d3.select(ReactDom.findDOMNode(this))
      .datum(this.props.edge.toJS());
  }

  render() {
    let { edge } = this.props,
      { id, visible, strokeWidth, rank } = edge;

    let className = classNames('connection', { active: visible });

    return (
      <g data-connection={id} className={className} data-rank={rank}>
        <line strokeWidth={strokeWidth} className="connection-line" />
        <ConnectionLabel edge={edge} />
      </g>
    );
  }
}

export default Connection;