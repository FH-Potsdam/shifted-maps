import styled, { css } from 'styled-components';
import { ifProp, theme } from '../styled';

interface ParagraphProps {
  lead?: boolean;
}

export default styled.p<ParagraphProps>`
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
