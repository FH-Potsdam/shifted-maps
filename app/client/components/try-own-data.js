import React, { Component } from 'react';

class TryOwnData extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    var loginPath = '/auth';

    if (ENV.exhibition)
      loginPath += '?redirect=/map?exhibition';

    return (
      <a className="app__try-own-data" href={loginPath}>
        <i className="icon icon--go" />
        Try it with
        <br />
        your own data!
      </a>
    );
  }
}

export default TryOwnData;