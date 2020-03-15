import styled from 'styled-components';
import { theme } from '../styled';

const Layout = styled.div`
  display: grid;
  grid-template-columns: repeat(12, calc((100% - ${theme('spacingUnit')}px * 11) / 12));
  grid-gap: ${theme('spacingUnit')}px;
`;

export default Layout;

interface LayoutItemProps {
  span: string;
}

export const LayoutItem = styled.div<LayoutItemProps>`
  grid-column: span ${props => props.span};
`;
