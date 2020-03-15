import { useCallback, useLayoutEffect, useRef } from 'react';

export default function useWidth<T extends HTMLElement>(callback: (width: number) => void, deps: any[] = []) {
  const measureRef = useRef<T | null>(null);
  callback = useCallback(callback, deps);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (measureRef.current == null) {
        throw new Error('Cannot update width. Element is missing.');
      }

      callback(measureRef.current.offsetWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [measureRef.current, callback]);

  return measureRef;
}
