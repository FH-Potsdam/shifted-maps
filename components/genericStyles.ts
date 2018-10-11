import 'normalize.css';

import { injectGlobal } from './styled';
import theme from './theme';

// @TODO Use styled components v4 global component to be able to use theme props (foreground, background colors).
injectGlobal`
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
