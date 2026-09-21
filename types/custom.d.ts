declare module '*.svg' {
  import { FunctionComponent, SVGProps } from 'react';

  const SVGComponent: FunctionComponent<SVGProps<SVGSVGElement>>;

  export default SVGComponent;
}

declare module 'body-scroll-lock' {
  function disableBodyScroll(element: HTMLElement): void;

  function enableBodyScroll(element: HTMLElement): void;

  function clearAllBodyScrollLocks(): void;
}

interface TextMetrics {
  readonly emHeightAscent?: number;
  readonly emHeightDescent?: number;
}
