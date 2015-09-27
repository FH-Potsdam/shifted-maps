import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { map, flatten } from 'lodash';
import debounce from 'mout/function/debounce';

class Scales extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scales: ['place-radius', 'place-stroke-width', 'connection-stroke-width']
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
    this.props.onUpdate(findDOMNode(this).querySelectorAll('[data-scale]'));
  }

  render() {
    let { scales } = this.state;

    let scaleElements = flatten(map(scales, function(scale) {
      return [
        <div key={scale + '-max-max'} data-scale={scale} data-domain-max data-range-max></div>,
        <div key={scale + '-max-min'} data-scale={scale} data-domain-max data-range-min></div>,
        <div key={scale + '-min-max'} data-scale={scale} data-domain-min data-range-max></div>,
        <div key={scale + '-min-min'} data-scale={scale} data-domain-min data-range-min></div>
      ];
    }));

    return (
      <div className="scale-list">
        {scaleElements}
      </div>
    );
  }
}

export default Scales;