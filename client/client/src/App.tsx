import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Chat Buddy AI
        </h1>
        <div className="text-sm">
          Status: {connected ? 
            <span className="text-green-600">Connected</span> : 
            <span className="text-red-600">Disconnected</span>
          }
        </div>
      </div>
    </div>
  );
}

export default App;