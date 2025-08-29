import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

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

    newSocket.on('chat:start', () => {
      setIsStreaming(true);
      setStreamingContent('');
    });

    newSocket.on('chat:token', (data: { token: string }) => {
      setStreamingContent(prev => prev + data.token);
    });

    newSocket.on('chat:complete', (data: { message: string }) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      setIsStreaming(false);
      setStreamingContent('');
    });

    newSocket.on('chat:error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
      setIsStreaming(false);
      setStreamingContent('');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (content: string) => {
    if (!socket || !connected) return;

    const newMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    socket.emit('chat:message', { messages: updatedMessages });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Chat Buddy AI
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-gray-500 mt-8">
              Start a conversation by typing a message below
            </div>
          )}
          
          {messages.map((msg, index) => (
            <Message key={index} role={msg.role} content={msg.content} />
          ))}
          
          {isStreaming && !streamingContent && (
            <TypingIndicator />
          )}
          
          {isStreaming && streamingContent && (
            <Message role="assistant" content={streamingContent} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={!connected || isStreaming} 
      />
    </div>
  );
}

export default App;