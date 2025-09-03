import { useEffect, useRef, useState, useCallback } from 'react';

interface UseTokenBufferOptions {
  flushInterval?: number;
  minBufferSize?: number;
}

export function useTokenBuffer(options: UseTokenBufferOptions = {}) {
  const {
    flushInterval = 50,
    minBufferSize = 3
  } = options;

  const [bufferedContent, setBufferedContent] = useState('');
  const tokenBuffer = useRef<string[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFlushTime = useRef<number>(Date.now());

  const flushBuffer = useCallback(() => {
    if (tokenBuffer.current.length > 0) {
      const tokensToAdd = tokenBuffer.current.join('');
      setBufferedContent(prev => prev + tokensToAdd);
      tokenBuffer.current = [];
      lastFlushTime.current = Date.now();
    }
  }, []);

  const addToken = useCallback((token: string) => {
    tokenBuffer.current.push(token);
    
    const timeSinceLastFlush = Date.now() - lastFlushTime.current;
    const shouldFlushBySize = tokenBuffer.current.length >= minBufferSize;
    const shouldFlushByTime = timeSinceLastFlush >= flushInterval;
    
    if (shouldFlushBySize || shouldFlushByTime) {
      flushBuffer();
    } else {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      
      flushTimerRef.current = setTimeout(() => {
        flushBuffer();
      }, flushInterval);
    }
  }, [flushBuffer, flushInterval, minBufferSize]);

  const forceFlush = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    flushBuffer();
  }, [flushBuffer]);

  const reset = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    tokenBuffer.current = [];
    setBufferedContent('');
    lastFlushTime.current = Date.now();
  }, []);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  return {
    bufferedContent,
    addToken,
    forceFlush,
    reset
  };
}