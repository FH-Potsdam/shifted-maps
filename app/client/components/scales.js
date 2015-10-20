import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { map, flatten } from 'lodash';
import debounce from 'mout/function/debounce';

class Scales extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scales: ['place-radius', 'place-stroke-width', 'connection-stroke-width'],
      sizers: ['place-minimize-radius']
    };
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    window.addEventListener('resize', debounce(this.dispatch.bind(this), 1000));
    this.dispatch();
  }

  dispatch() {
    let DOMNode = findDOMNode(this);

    this.props.onUpdate(
      DOMNode.querySelectorAll('[data-scale]'),
      DOMNode.querySelectorAll('[data-sizer]')
    );
  }

  render() {
    let { scales, sizers } = this.state;

    let scaleElements = flatten(map(scales, function(scale) {
      return [
        <div key={scale + '-max-max'} data-scale={scale} data-domain-max data-range-max />,
        <div key={scale + '-max-min'} data-scale={scale} data-domain-max data-range-min />,
        <div key={scale + '-min-max'} data-scale={scale} data-domain-min data-range-max />,
        <div key={scale + '-min-min'} data-scale={scale} data-domain-min data-range-min />
      ];
    }));

    let sizerElements = map(sizers, function(sizer) {
      return [
        <div key={sizer} data-sizer={sizer} />
      ];
    });

    return (
      <div className="scale-list">
        {scaleElements}
        {sizerElements}
      </div>
    );
  }
}

export default Scales;