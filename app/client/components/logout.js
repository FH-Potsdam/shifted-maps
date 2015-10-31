import React, { Component } from 'react';

class Logout extends Component {
  render() {
    return (
      <a className="app__logout" href="/auth/logout">
        <i className="icon icon--go" />
        Logout from
        <br />
        this Machine
      </a>
    );
  }
}

export default Logout;