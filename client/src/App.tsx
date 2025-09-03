import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import StreamingMessage from './components/StreamingMessage';
import ThinkingAnimation from './components/ThinkingAnimation';
import WelcomeScreen from './components/WelcomeScreen';
import ConnectionStatus from './components/ConnectionStatus';
import ConversationCards from './components/ConversationCards';
import TimelineView from './components/TimelineView';
import SearchBar from './components/SearchBar';
import AnimatedTransition from './components/AnimatedTransition';
import AnimatedLogo from './components/AnimatedLogo';
import { useConversations } from './hooks/useConversations';
import { useTokenBuffer } from './hooks/useTokenBuffer';
import { ViewMode } from './types/appState';
import { Conversation, Message as ConversationMessage } from './types/conversation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CARDS);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    bufferedContent,
    addToken,
    forceFlush,
    reset: resetBuffer
  } = useTokenBuffer({
    flushInterval: 50,
    minBufferSize: 3
  });

  const {
    conversations,
    loading: conversationsLoading,
    deleteConversation,
    searchConversations
  } = useConversations(socket);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, bufferedContent, isStreaming, isThinking]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('chat:start', () => {
      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
        setIsStreaming(true);
        resetBuffer();
      }, 800);
    });

    newSocket.on('chat:token', (data: { token: string }) => {
      addToken(data.token);
    });

    newSocket.on('chat:complete', (data: { message: string }) => {
      forceFlush();
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        setIsStreaming(false);
        resetBuffer();
      }, 100);
    });

    newSocket.on('chat:error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
      setIsThinking(false);
      setIsStreaming(false);
      resetBuffer();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    });

    newSocket.on('conversation:created', (data: { conversationId: number; title: string }) => {
      setCurrentConversationId(data.conversationId);
      setViewMode(ViewMode.CHAT);
    });

    newSocket.on('conversation:loaded', (data: { conversation: Conversation; messages: ConversationMessage[] }) => {
      console.log('Conversation loaded:', data);
      const chatMessages: ChatMessage[] = data.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      setMessages(chatMessages);
      setCurrentConversationId(data.conversation.id);
      setViewMode(ViewMode.CHAT);
    });

    newSocket.on('conversation:error', (data: { error: string }) => {
      console.error('Conversation error:', data.error);
      alert('Error loading conversation: ' + data.error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.close();
    };
  }, [addToken, forceFlush, resetBuffer]);

  const sendMessage = (content: string) => {
    if (!socket || !connected) return;

    const newMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue(''); // Clear the input value after sending

    socket.emit('chat:message', { 
      messages: updatedMessages,
      conversationId: currentConversationId 
    });

    if (viewMode === ViewMode.CARDS) {
      setViewMode(ViewMode.CHAT);
    }
  };

  const handleSelectConversation = (conversationId: number) => {
    if (socket) {
      socket.emit('conversation:load', { conversationId });
    }
    setCurrentConversationId(conversationId);
  };

  const handleDeleteConversation = (conversationId: number) => {
    deleteConversation(conversationId);
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
      setViewMode(ViewMode.CARDS);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    resetBuffer();
    setIsStreaming(false);
    setIsThinking(false);
    setCurrentConversationId(null);
    setViewMode(ViewMode.CARDS);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleHomeClick = () => {
    setViewMode(ViewMode.CARDS);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ConnectionStatus connected={connected} />
      
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {viewMode === ViewMode.CHAT ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>All Chats</span>
              </motion.button>
            ) : (
              <AnimatedLogo size="medium" />
            )}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Chat Buddy AI
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              New Chat
            </motion.button>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {connected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {viewMode === ViewMode.CHAT && conversations.length > 0 && (
        <TimelineView
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
        />
      )}

      <main className="flex-1 overflow-hidden">
        <AnimatedTransition mode={viewMode}>
          {viewMode === ViewMode.CARDS ? (
            <div className="h-full flex flex-col">
              <div className="px-6 pt-6">
                <SearchBar onSearch={searchConversations} />
              </div>
              <div className="flex-1 overflow-hidden">
                <ConversationCards
                  conversations={conversations}
                  onSelectConversation={handleSelectConversation}
                  onDeleteConversation={handleDeleteConversation}
                  loading={conversationsLoading}
                />
              </div>
              <ChatInput 
                onSendMessage={sendMessage} 
                disabled={!connected || isStreaming} 
                initialValue={inputValue}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4">
                  {messages.length === 0 && !isStreaming && !isThinking ? (
                    <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <Message key={index} role={msg.role} content={msg.content} />
                      ))}
                      
                      <AnimatePresence mode="wait">
                        {isThinking && (
                          <ThinkingAnimation key="thinking" />
                        )}
                        
                        {isStreaming && !isThinking && (
                          <StreamingMessage 
                            key="streaming"
                            content={bufferedContent} 
                            isComplete={false} 
                          />
                        )}
                      </AnimatePresence>
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>
              <ChatInput 
                onSendMessage={sendMessage} 
                disabled={!connected || isStreaming || isThinking} 
                initialValue={inputValue}
              />
            </div>
          )}
        </AnimatedTransition>
      </main>
    </div>
  );
}

export default App;