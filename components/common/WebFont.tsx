import { Component } from 'react';
import WebFontLoader from 'webfontloader';

class WebFont extends Component {
  componentDidMount() {
    WebFontLoader.load({
      typekit: {
        id: 'hil0jky',
      },
    });
  }

  render() {
    return null;
  }
}

export default WebFont;
