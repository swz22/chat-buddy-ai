import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 50,
  startDelay = 0,
  onComplete
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const reset = useCallback(() => {
    setDisplayedText('');
    setIsTyping(false);
    setIsComplete(false);
  }, []);

  const start = useCallback(() => {
    reset();
    setIsTyping(true);
  }, [reset]);

  useEffect(() => {
    if (!isTyping || !text) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();
      }
    };

    if (startDelay > 0) {
      timeoutId = setTimeout(typeNextChar, startDelay);
    } else {
      typeNextChar();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, speed, startDelay, isTyping, onComplete]);

  return {
    displayedText,
    isTyping,
    isComplete,
    start,
    reset
  };
}