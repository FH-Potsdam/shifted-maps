import { createGlobalStyle } from './styled';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
 @font-face {
    font-family: 'Overpass';
    font-style: normal;
    font-weight: 400;
    src: url(/static/fonts/overpass-regular.woff2) format('woff2');
  }

  @font-face {
    font-family: 'Overpass';
    font-style: italic;
    font-weight: 400;
    src: url(/static/fonts/overpass-italic.woff2) format('woff2');
  }

  @font-face {
    font-family: 'Overpass';
    font-style: normal;
    font-weight: 900;
    src: url(/static/fonts/overpass-extrabold.woff2) format('woff2');
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
