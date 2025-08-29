import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';
import MessageWithActions from './components/MessageWithActions';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import WelcomeScreen from './components/WelcomeScreen';
import Header from './components/Header';
import AnimatedBackground from './components/AnimatedBackground';
import ScrollToBottom from './components/ScrollToBottom';
import { useScrollDetection } from './hooks/useScrollDetection';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { showScrollButton, scrollToBottom } = useScrollDetection(mainRef);

  const autoScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    autoScrollToBottom();
  }, [messages, streamingContent, isStreaming]);

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
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        id: `msg-${Date.now()}`
      }]);
      setIsStreaming(false);
      setStreamingContent('');
    });

    newSocket.on('chat:error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
      setIsStreaming(false);
      setStreamingContent('');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        id: `msg-${Date.now()}`
      }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (content: string) => {
    if (!socket || !connected) return;

    const newMessage: ChatMessage = { 
      role: 'user', 
      content,
      id: `msg-${Date.now()}`
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    socket.emit('chat:message', { 
      messages: updatedMessages.map(({ role, content }) => ({ role, content }))
    });
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const regenerateLastMessage = () => {
    if (!socket || !connected || messages.length < 2) return;

    const lastAssistantIndex = messages.findLastIndex(msg => msg.role === 'assistant');
    if (lastAssistantIndex === -1) return;

    const messagesWithoutLast = messages.slice(0, lastAssistantIndex);
    setMessages(messagesWithoutLast);

    socket.emit('chat:message', { 
      messages: messagesWithoutLast.map(({ role, content }) => ({ role, content }))
    });
  };

  return (
    <div className="flex flex-col h-screen relative">
      <AnimatedBackground />
      
      <Header connected={connected} />

      <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-thin relative">
        <motion.div 
          className="max-w-4xl mx-auto p-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !isStreaming ? (
              <WelcomeScreen />
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageWithActions 
                    key={msg.id} 
                    role={msg.role} 
                    content={msg.content}
                    onDelete={() => deleteMessage(msg.id)}
                    onRegenerate={msg.role === 'assistant' && index === messages.length - 1 ? regenerateLastMessage : undefined}
                    isLast={index === messages.length - 1}
                  />
                ))}
                
                {isStreaming && !streamingContent && (
                  <TypingIndicator />
                )}
                
                {isStreaming && streamingContent && (
                  <MessageWithActions role="assistant" content={streamingContent} />
                )}
              </>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </motion.div>

        <ScrollToBottom show={showScrollButton} onClick={scrollToBottom} />
      </main>

      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={!connected || isStreaming} 
      />
    </div>
  );
}

export default App;