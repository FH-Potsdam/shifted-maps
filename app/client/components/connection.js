import React, { Component } from 'react';
import classNames from 'classnames';
import VelocityComponent from 'velocity-react/velocity-component';
import ConnectionLabel from './connection-label';

class Connection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLabel: true
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    let { edge } = this.props,
      nextEdge = nextProps.edge;

    return this.state.showLabel !== nextState.showLabel ||
      edge.visible !== nextEdge.visible ||
      edge.fromPoint !== nextEdge.fromPoint ||
      edge.toPoint !== nextEdge.toPoint ||
      edge.strokeWidth !== nextEdge.strokeWidth;
  }

  componentWillReceiveProps(nextProps) {
    let { edge } = this.props,
      nextEdge = nextProps.edge;

    // @TODO Animate is always true, for every state change, except view changes. How to do this?
    if (nextProps.animate && edge.fromPoint !== nextEdge.fromPoint && edge.toPoint !== nextEdge.toPoint)
      this.setState({ showLabel: false });
  }

  onAnimationComplete() {
    this.setState({ showLabel: true });
  }

  render() {
    let { edge, animate } = this.props,
      { visible, fromPoint, toPoint, strokeWidth, rank } = edge,
      coords = {};

    if (visible) {
      coords = {
        x1: fromPoint.get('x'),
        y1: fromPoint.get('y'),
        x2: toPoint.get('x'),
        y2: toPoint.get('y')
      };
    }

    let connection = <line strokeWidth={strokeWidth} className="connection-line" {...(!animate ? coords : {})} />;

    if (visible && animate) {
      connection = (
        <VelocityComponent animation={coords} duration={200} complete={this.onAnimationComplete.bind(this)}>
          {connection}
        </VelocityComponent>
      );
    }

    let className = classNames('connection', { active: visible });

    return (
      <g className={className} data-rank={rank}>
        {connection}
        <ConnectionLabel edge={edge} visible={this.state.showLabel} />
      </g>
    );
  }
}

export default Connection;