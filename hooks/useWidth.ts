import { useLayoutEffect, useRef } from 'react';

export default function useWidth<T extends HTMLElement>(callback: (width: number) => void) {
  const measureRef = useRef<T | null>(null);

  const updateWidth = () => {
    if (measureRef.current == null) {
      throw new Error('Cannot update width. Element is missing.');
    }

    callback(measureRef.current.offsetWidth);
  };

  useLayoutEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [measureRef.current]);

  return measureRef;
}
