import { DefaultTheme } from 'styled-components';

const spacingUnit = 16;

const theme: DefaultTheme = {
  backgroundColor: '#ffffff',
  breakpoints: {
    desktop: 1000,
    tablet: 600,
  },
  fontSize: spacingUnit, // 16
  fontSizeBig: spacingUnit * 1.25, // 20
  fontSizeHero: spacingUnit * 2, // 32
  fontSizeMini: spacingUnit * 0.625, // 10
  fontSizeSmall: spacingUnit * 0.75, // 12
  foregroundColor: '#333333',
  highlightColor: '#2963a5',
  shortTransitionDuration: '200ms',
  spacingUnit,
  transitionDuration: '400ms',
};

export default theme;
