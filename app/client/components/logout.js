import React, { Component } from 'react';

class Logout extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    var logoutPath = '/auth/logout';

    if (ENV.exhibition)
      logoutPath += '?redirect=/?exhibition';

    return (
      <a className="app__logout" href={logoutPath}>
        <i className="icon icon--go" />
        Logout from
        <br />
        this Machine
      </a>
    );
  }
}

export default Logout;