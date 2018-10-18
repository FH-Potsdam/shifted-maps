declare module '*.svg' {
  import { StatelessComponent, SVGProps } from 'react';

  const SVGComponent: StatelessComponent<SVGProps<SVGSVGElement>>;

  export default SVGComponent;
}
