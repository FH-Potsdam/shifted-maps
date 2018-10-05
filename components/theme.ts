export type Theme = {
  spacingUnit: number;
  foregroundColor: string;
  backgroundColor: string;
  highlightColor: string;
  fontSizeBig: number;
  fontSizeHero: number;
  fontSizeSmall: number;
  shortTransitionDuration: string;
  breakpoints: { [name in Breakpoints]: number };
};

export type Breakpoints = 'tablet' | 'desktop';

const spacingUnit = 16;

const theme: Theme = {
  spacingUnit,
  backgroundColor: '#ffffff',
  foregroundColor: '#333333',
  highlightColor: '#2963a5',
  fontSizeSmall: spacingUnit * 0.75,
  fontSizeBig: spacingUnit * 1.25,
  fontSizeHero: spacingUnit * 2,
  shortTransitionDuration: '200ms',
  breakpoints: {
    tablet: 600,
    desktop: 1000,
  },
};

export default theme;