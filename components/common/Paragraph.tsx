import styled, { css, ifProp, theme } from '../styled';

interface Props {
  lead?: boolean;
}

export default styled.p<Props>`
  margin: 0;

  & + & {
    margin-top: ${theme('spacingUnit')}px;
  }

  h1 + & {
    margin-top: ${theme('spacingUnit')}px;
  }

  ${ifProp(
    'lead',
    css`
      font-style: italic;
      font-size: ${theme('fontSizeBig')}px;
    `
  )};
`;
