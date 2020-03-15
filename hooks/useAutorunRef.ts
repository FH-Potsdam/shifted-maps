import { useRef } from 'react';
import useAutorun from './useAutorun';

export default function useAutorunRef<T>(callback: (ref: T) => void, dependencies?: readonly any[]) {
  const ref = useRef<T | null>(null);

  useAutorun(() => {
    if (ref.current == null) {
      return;
    }

    callback(ref.current);
  }, [ref.current, ...dependencies!]);

  return ref;
}
