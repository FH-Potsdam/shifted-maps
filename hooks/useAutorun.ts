import { autorun, IAutorunOptions } from 'mobx';
import { useLayoutEffect } from 'react';

export default function useAutorun(callback: () => void, options?: IAutorunOptions) {
  return useLayoutEffect(() => autorun(callback, options), [callback, options]);
}
