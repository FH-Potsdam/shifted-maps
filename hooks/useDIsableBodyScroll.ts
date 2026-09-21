import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useEffect, useRef } from 'react';

export default function useDisableBodyScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const targetElement = ref.current;

    if (targetElement == null) {
      return;
    }

    disableBodyScroll(targetElement);

    return () => {
      enableBodyScroll(targetElement);
    };
  }, []);

  return ref;
}
