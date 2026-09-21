import { Breakpoints, css, DefaultTheme, Interpolation } from 'styled-components';

export function theme(key: keyof DefaultTheme) {
  return (props: { theme: DefaultTheme }) => props.theme[key];
}

export function ifProp<P extends object>(key: keyof P, then: Interpolation<P>) {
  return (props: P) => props[key] && then;
}

export function switchProp<P extends object>(key: keyof P, cases: { [key: string]: Interpolation<P> }) {
  return (props: P) => cases[String(props[key])];
}

export function mediaQuery<P extends object>(name: Breakpoints) {
  return (strings: TemplateStringsArray, ...interpolations: Interpolation<P>[]) => {
    return css<P>`
      @media (min-width: ${(props) => props.theme.breakpoints[name] / 16}em) {
        ${css<P>(strings, ...interpolations)};
      }
    `;
  };
}
