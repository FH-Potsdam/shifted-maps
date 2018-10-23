export interface ITheme {
  spacingUnit: number;
  foregroundColor: string;
  backgroundColor: string;
  highlightColor: string;
  fontSize: number;
  fontSizeBig: number;
  fontSizeHero: number;
  fontSizeMini: number;
  fontSizeSmall: number;
  shortTransitionDuration: string;
  transitionDuration: string;
  breakpoints: { [name in Breakpoints]: number };
}

export type Breakpoints = 'tablet' | 'desktop';

const spacingUnit = 16;

const theme: ITheme = {
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
