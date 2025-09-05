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
        reconnection: false,
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
          return;
        }
        
        if (connectionManager.current?.shouldRetry()) {
          const delay = connectionManager.current.calculateDelay();
          setRetryCount(connectionManager.current.getRetryCount() + 1);
          setNextRetryIn(delay);
          
          let timeLeft = delay;
          retryIntervalRef.current = setInterval(() => {
            timeLeft -= 100;
            setNextRetryIn(Math.max(0, timeLeft));
            
            if (timeLeft <= 0 && retryIntervalRef.current) {
              clearInterval(retryIntervalRef.current);
            }
          }, 100);
          
          connectionManager.current.scheduleRetry(() => {
            createSocket();
          });
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      setSocket(newSocket);
    };

    createSocket();

    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      connectionManager.current?.cleanup();
      socket?.disconnect();
    };
  }, [options.url]);

  const reconnect = useCallback(() => {
    socket?.disconnect();
    connectionManager.current?.reset();
    setRetryCount(0);
    setNextRetryIn(0);
    const newSocket = io(options.url);
    setSocket(newSocket);
  }, [socket, options.url]);

  return {
    socket,
    connected,
    retryCount,
    nextRetryIn,
    reconnect,
    retryStatus: connectionManager.current?.getRetryStatus() || 'Unknown'
  };
}