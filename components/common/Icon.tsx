import styled, { injectGlobal, switchProp } from '../styled';

interface Props {
  name: string;
}

const Icon = styled.i<Props>`
  font-family: 'icomoon';
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  ${switchProp('name', {
    go: `&:before {
      content: '\\e800';
    }`,
    geographic: `&:before {
      content: '\\e801';
    }`,
    duration: `&:before {
      content: '\\e802';
    }`,
    frequency: `&:before {
      content: '\\e803';
    }`,
    info: `&:before {
      content: '\\e804';
    }`,
  })};
`;

export default Icon;

injectGlobal`
  @font-face {
    font-family: 'icomoon';
    src: url('/static/fonts/icomoon.ttf?3vnion') format('truetype'), url('/static/fonts/icomoon.woff?3vnion') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;
