import { useEffect, useRef, RefObject } from 'react';

export function useScrollPreservation(
  containerRef: RefObject<HTMLElement>,
  key: string,
  dependencies: any[] = []
) {
  const scrollPositions = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const savedPosition = scrollPositions.current.get(key);
    if (savedPosition !== undefined) {
      container.scrollLeft = savedPosition;
    }

    const handleScroll = () => {
      scrollPositions.current.set(key, container.scrollLeft);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [key, ...dependencies]);

  const savePosition = () => {
    const container = containerRef.current;
    if (container) {
      scrollPositions.current.set(key, container.scrollLeft);
    }
  };

  const restorePosition = () => {
    const container = containerRef.current;
    if (container) {
      const savedPosition = scrollPositions.current.get(key);
      if (savedPosition !== undefined) {
        container.scrollLeft = savedPosition;
      }
    }
  };

  const clearPosition = () => {
    scrollPositions.current.delete(key);
  };

  return { savePosition, restorePosition, clearPosition };
}