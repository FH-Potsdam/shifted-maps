import { useEffect, useState } from 'react';

export default function useTouch() {
  const [touch, setTouch] = useState(true);

  useEffect(() => {
    let detectingTouch = false;

    const removeTouchDetection = () => {
      if (!detectingTouch) {
        return;
      }

      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
      detectingTouch = false;
    };

    const handleTouchStart = () => {
      setTouch(true);
      removeTouchDetection();
    };

    const handleMouseMove = () => {
      setTouch(false);
      removeTouchDetection();
    };

    const addTouchDetection = () => {
      if (detectingTouch) {
        return;
      }

      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('mousemove', handleMouseMove);
      detectingTouch = true;
    };

    const handleResize = () => {
      addTouchDetection();
    };

    addTouchDetection();
    window.addEventListener('resize', handleResize);

    return () => {
      removeTouchDetection();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return touch;
}
