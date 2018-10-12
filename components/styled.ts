import * as styledComponents from 'styled-components';

import { Breakpoints, ITheme } from './theme';

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
  withTheme,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>;

export { css, injectGlobal, keyframes, ThemeProvider, withTheme };
export default styled;

export function theme(key: keyof ITheme) {
  return (props: { theme: ITheme }) => props.theme[key];
}

export function ifProp<P>(key: keyof P, then: any) {
  return (props: P) => props[key] && then;
}

export function switchProp<P>(
  key: keyof P,
  cases: { [key: string]: styledComponents.InterpolationValue }
) {
  return (props: P) => cases[String(props[key])];
}

export function mediaQuery<P>(name: Breakpoints) {
  return (
    strings: TemplateStringsArray,
    ...interpolations: Array<
      styledComponents.Interpolation<styledComponents.ThemedStyledProps<P, ITheme>>
    >
  ) => {
    return css<P>`
      @media (min-width: ${props => props.theme.breakpoints[name] / 16}em) {
        ${css<P>(strings, ...interpolations)};
      }
    `;
  };
}
