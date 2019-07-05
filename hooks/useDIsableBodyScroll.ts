import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useEffect, useRef } from 'react';

export default function useDisableBodyScroll() {
  const ref = useRef<HTMLElement>();

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    disableBodyScroll(ref.current!);

    return () => {
      enableBodyScroll(ref.current!);
    };
  }, [ref.current]);

  return ref;
}
