import { createGlobalStyle } from './styled';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body,
  html,
  #__next {
    height: 100%;
  }

  html {
    font-family: 'Overpass', sans-serif;
    font-size: 16px;
    color: black;
    line-height: 1.5;
  }

  body {
    background-color: ${theme.backgroundColor};
  }

  strong {
    font-weight: 900;
  }

  p {
    margin: 0;
  }
`;

export default GlobalStyle;
