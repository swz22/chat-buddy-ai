import { useState, useEffect, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground';
import LogoWrapper from './components/LogoWrapper';
import ThemeToggle from './components/ThemeToggle';
import EditableMessage from './components/EditableMessage';
import EnhancedChatInput from './components/EnhancedChatInput';
import StreamingMessage from './components/StreamingMessage';
import ThinkingAnimation from './components/ThinkingAnimation';
import WelcomeScreen from './components/WelcomeScreen';
import PremiumConversationCards from './components/PremiumConversationCards';
import TimelineView from './components/TimelineView';
import SearchBar from './components/SearchBar';
import CommandPalette from './components/CommandPalette';
import OnboardingTips from './components/OnboardingTips';
import { useConversations } from './hooks/useConversations';
import { useTokenBuffer } from './hooks/useTokenBuffer';
import { useCommandPalette } from './hooks/useCommandPalette';
import { ViewMode } from './types/appState';
import { Message as ConversationMessage } from './types/conversation';
import { API_URL } from './config/api';

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CARDS);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFirstVisit] = useState(() => {
    const hasVisited = localStorage.getItem('has-visited');
    if (!hasVisited) {
      localStorage.setItem('has-visited', 'true');
      return true;
    }
    return false;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    bufferedContent, 
    addToken, 
    forceFlush, 
    reset: resetBuffer 
  } = useTokenBuffer();
  
  const { 
    conversations, 
    loading: conversationsLoading,
    loadConversation,
    deleteConversation,
    searchConversations,
    loadConversations
  } = useConversations(socket);
  
  const { 
    isOpen: isCommandPaletteOpen, 
    close: closeCommandPalette, 
    toggle: toggleCommandPalette 
  } = useCommandPalette();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  useEffect(() => {
    const socketInstance = io(API_URL || 'http://localhost:5000', {
      transports: ['polling'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.io.on('error', (error) => {
      if (!error.message.includes('WebSocket')) {
        console.error('Socket.io error:', error);
      }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server via polling');
      setConnected(true);
      if (currentConversationId) {
        socketInstance.emit('conversation:load', { conversationId: currentConversationId });
      }
      socketInstance.emit('conversations:list');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      if (!error.message.includes('WebSocket')) {
        console.error('Connection error:', error.message);
      }
      setConnected(false);
    });

    socketInstance.on('chat:start', () => {
      setIsThinking(true);
      setIsStreaming(false);
      resetBuffer();
    });

    socketInstance.on('chat:token', (data) => {
      setIsThinking(false);
      setIsStreaming(true);
      addToken(data.token);
    });

    socketInstance.on('chat:complete', (data) => {
      setIsStreaming(false);
      setIsThinking(false);
      
      const completeMessage: ChatMessage = {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completeMessage]);
      forceFlush();
      resetBuffer();
      
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
        if (socketInstance && socketInstance.connected) {
          socketInstance.emit('conversations:list');
        }
      }
    });

    socketInstance.on('conversation:created', (data) => {
      setCurrentConversationId(data.conversationId);
      if (socketInstance && socketInstance.connected) {
        socketInstance.emit('conversations:list');
      }
    });

    socketInstance.on('conversation:loaded', (data) => {
      const loadedMessages: ChatMessage[] = data.messages.map((msg: ConversationMessage) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.created_at ? new Date(msg.created_at) : undefined
      }));
      setMessages(loadedMessages);
    });

    socketInstance.on('message:edited', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.newContent }
          : msg
      ));
    });

    socketInstance.on('chat:error', (error) => {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setIsThinking(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && connected) {
      loadConversations();
    }
  }, [socket, connected, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, bufferedContent]);

  useEffect(() => {
    if (searchQuery && socket) {
      searchConversations(searchQuery);
    } else if (!searchQuery && socket) {
      loadConversations();
    }
  }, [searchQuery, socket, searchConversations, loadConversations]);

  const handleGoHome = () => {
    setViewMode(ViewMode.CARDS);
    setCurrentConversationId(null);
    setMessages([]);
    setInputValue('');
    resetBuffer();
  };

  const handleSendMessage = (content: string) => {
    if (!socket || !content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const allMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    socket.emit('chat:message', {
      messages: allMessages,
      conversationId: currentConversationId || undefined
    });
  };

  const handleSelectConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setViewMode(ViewMode.CHAT);
    loadConversation(conversationId);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    deleteConversation(conversationId);
    if (conversationId === currentConversationId) {
      setCurrentConversationId(null);
      setMessages([]);
      setViewMode(ViewMode.CARDS);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setViewMode(ViewMode.CHAT);
    setInputValue('');
    resetBuffer();
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case 'new-chat':
        handleNewChat();
        break;
      case 'toggle-view':
        setViewMode(viewMode === ViewMode.CARDS ? ViewMode.CHAT : ViewMode.CARDS);
        break;
      case 'clear-history':
        if (confirm('Are you sure you want to clear all conversations?')) {
          conversations.forEach(conv => handleDeleteConversation(conv.id));
        }
        break;
    }
    closeCommandPalette();
  };

  const handleEditMessage = (messageId: number, newContent: string) => {
    if (socket) {
      socket.emit('message:edit', {
        messageId,
        newContent
      });
    }
  };

  const currentView = useMemo(() => {
    if (viewMode === ViewMode.CARDS) {
      return (
        <PremiumConversationCards
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          loading={conversationsLoading}
        />
      );
    }

    return (
      <div className="flex flex-col h-full">
        {conversations.length > 0 && (
          <TimelineView
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
          />
        )}
        
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isStreaming ? (
            <WelcomeScreen onSuggestionClick={handleSendMessage} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="flex items-start gap-3 max-w-3xl">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm shadow-sm">
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">U</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-3 max-w-3xl">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">AI</span>
                          </div>
                          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 dark:border-gray-700">
                            {message.id ? (
                              <EditableMessage
                                content={message.content}
                                onEdit={(newContent) => handleEditMessage(message.id!, newContent)}
                              />
                            ) : (
                              <div className="message-content">
                                <p className="text-sm">{message.content}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">AI</span>
                    </div>
                    <ThinkingAnimation />
                  </div>
                </motion.div>
              )}

              {isStreaming && bufferedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">AI</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 dark:border-gray-700">
                      <StreamingMessage content={bufferedContent} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <EnhancedChatInput
          value={inputValue}
          onChange={setInputValue}
          onSendMessage={handleSendMessage}
          disabled={!connected || isStreaming}
          placeholder={connected ? "Message Chat Buddy AI..." : "Connecting..."}
        />
      </div>
    );
  }, [viewMode, conversations, messages, bufferedContent, isStreaming, isThinking, inputValue, connected, currentConversationId, conversationsLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <AnimatedBackground />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <LogoWrapper size="small" showText={true} onClick={handleGoHome} />
            
            <div className="flex items-center gap-4">
              {viewMode === ViewMode.CARDS && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search conversations..."
                />
              )}
              
              <motion.button
                onClick={handleNewChat}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </span>
              </motion.button>
              
              <button
                onClick={toggleCommandPalette}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700">⌘K</kbd>
                <span className="text-gray-600 dark:text-gray-400">Quick actions</span>
              </button>
              
              <ThemeToggle />
              
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            </div>
          </div>
        </div>
      </header>
      
      <main className="pt-16 h-screen flex flex-col">
        {currentView}
      </main>
      
      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          onCommand={handleCommand}
        />
      )}
      
      {isFirstVisit && <OnboardingTips />}
    </div>
  );
}

export default App;