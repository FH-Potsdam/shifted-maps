import 'normalize.css';

import { injectGlobal } from './styled';
import theme from './theme';

// @TODO Use styled components v4 global component to be able to use theme props (foreground, background colors).
injectGlobal`
  @import url("https://use.typekit.net/hil0jky.css");

  @font-face {
    font-family: 'icomoon';
    src: url('/static/fonts/icomoon.ttf?3vnion') format('truetype'), url('/static/fonts/icomoon.woff?3vnion') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  * {
    box-sizing: border-box;
  }

  body,
  html,
  #__next {
    height: 100%;
    overflow: hidden;
  }

  html {
    font-family: "soleil", sans-serif;
    font-size: 16px;
    color: black;
    line-height: 1.5;
  }

  body {
    background-color: ${theme.backgroundColor};
  }
`;
