// @TODO Use @types/react-leaflet only once updated.
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27887

import * as React from 'react';
import * as L from 'leaflet';

declare module 'react-leaflet' {
  export interface LeafletContext {
    map?: L.Map;
    pane?: string;
    layerContainer?: LayerContainer;
    popupContainer?: L.Layer;
  }

  export type WrappedProps = {
    leaflet: LeafletContext;
  };

  // https://stackoverflow.com/questions/48215950/exclude-property-from-type
  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  export function withLeaflet<T extends WrappedProps>(
    WrappedComponent: React.ComponentType<T>
  ): React.ComponentType<Omit<T, 'leaflet'>>;
}
