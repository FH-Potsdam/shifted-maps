import React, { Component } from 'react';
import d3 from 'd3';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import PlaceMap from './place-map';
import PlaceDeco from './place-deco';
import PlaceLabel from './place-label';

class Place extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.node !== nextProps.node;
  }

  componentDidMount() {
    this.appendData();
  }

  componentDidUpdate() {
    this.appendData();
  }

  appendData() {
    d3.select(ReactDom.findDOMNode(this))
      .datum(this.props.node);
  }

  render() {
    let { node, onHover } = this.props,
      { hover, rank, visible } = node;

    let className = classNames('place', {active: visible, hover});

    return (
      <g data-rank={rank} className={className}
         onMouseEnter={onHover.bind(this, true)}
         onMouseLeave={onHover.bind(this, false)}>
        <PlaceMap node={node}/>
        <PlaceDeco node={node}/>
        <PlaceLabel node={node}/>
      </g>
    );
  }
}

export default Place;