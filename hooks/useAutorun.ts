import { autorun, IAutorunOptions } from 'mobx';
import { useEffect } from 'react';

export default function useAutorun(callback: () => void, dependencies?: readonly any[], options?: IAutorunOptions) {
  return useEffect(() => autorun(callback, options), dependencies);
}
