const isDevelopment = import.meta.env.MODE === 'development';

export const API_URL = isDevelopment 
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_URL as string) || 'https://chat-buddy-backend.railway.app';

export const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};