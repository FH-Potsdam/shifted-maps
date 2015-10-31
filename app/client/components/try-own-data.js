import React, { Component } from 'react';

class TryOwnData extends Component {
  render() {
    return (
      <a className="app__try-own-data" href="/auth">
        <i className="icon icon--go" />
        Try it with your own data!
      </a>
    );
  }
}

export default TryOwnData;