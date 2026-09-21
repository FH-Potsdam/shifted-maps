import { useCallback, useRef } from 'react';
import useAutorun from './useAutorun';

export default function useAutorunRef<T>(callback: (ref: T) => void) {
  const ref = useRef<T | null>(null);

  const run = useCallback(() => {
    if (ref.current == null) {
      return;
    }

    callback(ref.current);
  }, [callback]);

  useAutorun(run);

  return ref;
}
