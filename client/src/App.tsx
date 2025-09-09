import { useState, useEffect, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
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
import { Conversation, Message as ConversationMessage } from './types/conversation';
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, bufferedContent, isThinking]);

  useEffect(() => {
    const newSocket = io(API_URL || 'http://localhost:5000');

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
      setIsStreaming(false);
      resetBuffer();
    });

    newSocket.on('chat:token', (data: { token: string }) => {
      setIsThinking(false);
      setIsStreaming(true);
      addToken(data.token);
    });

    newSocket.on('chat:complete', (data: { message: string; messageId: number; conversationId: number }) => {
      forceFlush();
      setMessages(prev => [...prev, { 
        id: data.messageId,
        role: 'assistant', 
        content: data.message,
        timestamp: new Date()
      }]);
      setIsStreaming(false);
      setIsThinking(false);
      resetBuffer();
      
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      if (newSocket.connected) {
        loadConversations();
      }
    });

    newSocket.on('conversation:created', (data: { conversationId: number; title: string }) => {
      setCurrentConversationId(data.conversationId);
    });

    newSocket.on('conversation:loaded', (data: { conversation: Conversation; messages: ConversationMessage[] }) => {
      const chatMessages: ChatMessage[] = data.messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.created_at ? new Date(msg.created_at) : new Date()
      }));
      setMessages(chatMessages);
      setCurrentConversationId(data.conversation.id!);
      setViewMode(ViewMode.CHAT);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (searchQuery && socket?.connected) {
      searchConversations(searchQuery);
    } else if (!searchQuery && socket?.connected) {
      loadConversations();
    }
  }, [searchQuery, socket]);

  const handleSendMessage = (message: string) => {
    if (!socket?.connected || !message.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setViewMode(ViewMode.CHAT);

    socket.emit('chat:message', {
      messages: [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      })),
      conversationId: currentConversationId
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setViewMode(ViewMode.CHAT);
    setInputValue('');
  };

  const handleSelectConversation = (conversationId: number) => {
    if (socket?.connected) {
      loadConversation(conversationId);
    }
  };

  const handleDeleteConversation = (conversationId: number) => {
    if (socket?.connected) {
      deleteConversation(conversationId);
      if (currentConversationId === conversationId) {
        handleNewChat();
      }
    }
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case 'new':
        handleNewChat();
        break;
      case 'toggle-theme':
        document.documentElement.classList.toggle('dark');
        break;
      default:
        break;
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
      <div className="flex-1 flex flex-col h-screen pt-16">
        {conversations.length > 0 && (
          <TimelineView
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
          />
        )}
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isStreaming && !isThinking ? (
              <WelcomeScreen onSuggestionClick={handleSendMessage} />
            ) : (
              <div className="px-4 py-8 space-y-6">
                {messages.map((message, index) => (
                  <EditableMessage
                    key={message.id || index}
                    message={message}
                    onEdit={(newContent) => {
                      if (message.id && socket) {
                        socket.emit('message:edit', { 
                          messageId: message.id, 
                          newContent 
                        });
                      }
                    }}
                  />
                ))}
                
                {isThinking && <ThinkingAnimation />}
                
                {isStreaming && bufferedContent && (
                  <StreamingMessage content={bufferedContent} />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
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
            <LogoWrapper size="small" showText={true} />
            
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