declare module '*.json' {
  const value: any;

  export default value;
}

declare module '*.svg' {
  import { StatelessComponent, SVGProps } from 'react';

  const SVGComponent: StatelessComponent<SVGProps<SVGSVGElement>>;

  export default SVGComponent;
}

declare module 'body-scroll-lock' {
  function disableBodyScroll(element: HTMLElement): void;

  function enableBodyScroll(element: HTMLElement): void;
}
