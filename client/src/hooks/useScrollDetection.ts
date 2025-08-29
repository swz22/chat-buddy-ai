import { useState, useEffect, RefObject } from 'react';

export function useScrollDetection(
  containerRef: RefObject<HTMLElement>,
  threshold: number = 100
) {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > threshold);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, threshold]);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  };

  return { showScrollButton, scrollToBottom };
}