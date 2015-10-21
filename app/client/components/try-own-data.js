import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';

class TryOwnData extends Component {
  render() {
    return (
      <a className="ui__try-own-data" href="/auth">
        <i className="icon icon--go" />
        Try it with your own data!
      </a>
    );
  }
}

export default TryOwnData;