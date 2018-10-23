import use from 'reuse';

import styled, { css, theme } from '../styled';

const Heading = styled(use('h1'))`
  color: ${theme('highlightColor')};
  margin: 0;

  ${props =>
    props.use === 'h1' &&
    css`
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `};
`;

Heading.defaultProps = {
  use: 'h1',
};

export default Heading;
