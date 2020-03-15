import styled from 'styled-components';
import { theme } from '../styled';

const Link = styled.a`
  transition: color ${theme('shortTransitionDuration')};
  text-decoration: none;
  color: ${theme('foregroundColor')};
  cursor: pointer;

  &:hover {
    color: ${theme('highlightColor')};
  }
`;

export default Link;
