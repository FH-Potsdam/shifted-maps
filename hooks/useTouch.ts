import { useEffect, useRef, useState } from 'react';

export default function useTouch() {
  const detectingTouchRef = useRef(false);
  const [touch, setTouch] = useState(true);

  const handleTouchStart = () => {
    setTouch(true);
    removeTouchDetection();
  };

  const handleMouseMove = () => {
    setTouch(false);
    removeTouchDetection();
  };

  const addTouchDetection = () => {
    if (detectingTouchRef.current) {
      return;
    }

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('mousemove', handleMouseMove);

    detectingTouchRef.current = true;
  };

  const removeTouchDetection = () => {
    if (!detectingTouchRef.current) {
      return;
    }

    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('mousemove', handleMouseMove);

    detectingTouchRef.current = false;
  };

  const handleResize = () => {
    addTouchDetection();
  };

  useEffect(() => {
    addTouchDetection();
    window.addEventListener('resize', handleResize);

    return () => {
      removeTouchDetection();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return touch;
}
