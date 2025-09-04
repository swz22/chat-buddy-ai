import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionManager } from '../utils/connectionManager';

interface UseConnectionOptions {
  url: string;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export function useConnection(options: UseConnectionOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState(0);
  const maxRetries = options.maxRetries || 10;
  const connectionManager = useRef<ConnectionManager>();
  const retryIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    connectionManager.current = new ConnectionManager({
      maxRetries: maxRetries,
      baseDelay: options.baseDelay || 1000,
      maxDelay: options.maxDelay || 30000,
    });

    const createSocket = () => {
      const newSocket = io(options.url, {
        transports: ['websocket', 'polling'],
        reconnection: false, // We'll handle reconnection manually
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        setRetryCount(0);
        setNextRetryIn(0);
        connectionManager.current?.reset();
        
        if (retryIntervalRef.current) {
          clearInterval(retryIntervalRef.current);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected us, don't retry
          return;
        }
        
        if (connectionManager.current?.shouldRetry()) {
          const delay = connectionManager.current.calculateDelay();
          setRetryCount(connectionManager.current.getRetryCount() + 1);
          setNextRetryIn(delay);
          
          // Update countdown
          let timeLeft = delay;
          retryIntervalRef.current = setInterval(() => {
            timeLeft -= 100;
            setNextRetryIn(Math.max(0, timeLeft));
            
            if (timeLeft <= 0 && retryIntervalRef.current) {
              clearInterval(retryIntervalRef.current);
            }
          }, 100);
          
          connectionManager.current.scheduleRetry(() => {
            console.log('Attempting to reconnect...');
            newSocket.connect();
          });
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      setSocket(newSocket);
      return newSocket;
    };

    const socket = createSocket();

    return () => {
      connectionManager.current?.cleanup();
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      socket.disconnect();
    };
  }, [options.url, maxRetries, options.baseDelay, options.maxDelay]);

  const reconnect = useCallback(() => {
    if (socket && !connected) {
      connectionManager.current?.reset();
      socket.connect();
    }
  }, [socket, connected]);

  return {
    socket,
    connected,
    retryCount,
    maxRetries,
    nextRetryIn,
    reconnect
  };
}