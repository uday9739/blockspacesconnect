import { useCallback, useEffect, useState } from 'react';

type WindowSize = {
  width?: number;
  height?: number;
  rem?: number;
};

export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({});

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
      rem: parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size'), 10),
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}