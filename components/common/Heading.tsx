import use from 'reuse';

import styled, { theme } from '../styled';

const Heading = styled(use('h1'))`
  color: ${theme('highlightColor')};
  margin: 0;

  ${props => props.use === 'h1' && `text-transform: uppercase;`};
`;

Heading.defaultProps = {
  use: 'h1',
};

export default Heading;
