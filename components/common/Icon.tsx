import styled, { injectGlobal, switchProp } from '../styled';

interface IProps {
  name: string;
}

const Icon = styled.i<IProps>`
  font-family: 'icomoon';
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  ${switchProp('name', {
    duration: `&:before {
      content: '\\e802';
    }`,
    frequency: `&:before {
      content: '\\e803';
    }`,
    geographic: `&:before {
      content: '\\e801';
    }`,
    go: `&:before {
      content: '\\e800';
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
