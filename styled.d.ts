// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export type Breakpoints = 'tablet' | 'desktop';

  export interface DefaultTheme {
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
}
