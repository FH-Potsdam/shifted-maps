import styled, { theme } from '../styled';

const Layout = styled.div`
  display: grid;
  grid-template-columns: repeat(12, calc((100% - ${theme('spacingUnit')}px * 11) / 12));
  grid-gap: ${theme('spacingUnit')}px;
`;

export default Layout;

interface IProps {
  span: string;
}

export const LayoutItem = styled.div<IProps>`
  grid-column: span ${props => props.span};
`;
