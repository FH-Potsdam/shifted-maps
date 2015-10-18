import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';

class TryDemo extends Component {
  render() {
    return (
      <div className="try-demo">
        <i className="icon icon--go" />
        Try it with your own data!
      </div>
    );
  }
}

export default TryDemo;