import { autorun, IAutorunOptions } from 'mobx';
import { useLayoutEffect } from 'react';

export default function useAutorun(callback: () => void, dependencies?: readonly any[], options?: IAutorunOptions) {
  return useLayoutEffect(() => autorun(callback, options), dependencies);
}
