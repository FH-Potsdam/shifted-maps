import use from 'reuse';

import styled, { theme } from '../styled';

const Layout = styled(use('div'))`
  display: grid;
  grid-template-columns: repeat(12, calc((100% - ${theme('spacingUnit')}px * 11) / 12));
  grid-gap: ${theme('spacingUnit')}px;
`;

export default Layout;

interface IProps {
  span: string;
}

export const LayoutItem = styled<IProps>(use('div'))`
  grid-column: span ${props => props.span};
`;
