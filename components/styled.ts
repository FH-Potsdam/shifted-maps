import {
  Breakpoints,
  css,
  DefaultTheme,
  Interpolation,
  InterpolationValue,
  ThemedStyledProps,
} from 'styled-components';

export function theme(key: keyof DefaultTheme) {
  return (props: { theme: DefaultTheme }) => props.theme[key];
}

export function ifProp<P>(key: keyof P, then: any) {
  return (props: P) => props[key] && then;
}

export function switchProp<P>(key: keyof P, cases: { [key: string]: InterpolationValue }) {
  return (props: P) => cases[String(props[key])];
}

export function mediaQuery<P extends object>(name: Breakpoints) {
  return (
    strings: TemplateStringsArray,
    ...interpolations: Array<Interpolation<ThemedStyledProps<P, DefaultTheme>>>
  ) => {
    return css<P>`
      @media (min-width: ${props => props.theme.breakpoints[name] / 16}em) {
        ${css<P>(strings, ...interpolations)};
      }
    `;
  };
}
