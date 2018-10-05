import { PureComponent } from 'react';
import WebFontLoader from 'webfontloader';

class WebFont extends PureComponent {
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
