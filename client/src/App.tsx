import { useState, useEffect, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import EditableMessage from './components/EditableMessage';
import EnhancedChatInput from './components/EnhancedChatInput';
import StreamingMessage from './components/StreamingMessage';
import ThinkingAnimation from './components/ThinkingAnimation';
import WelcomeScreen from './components/WelcomeScreen';
import ConversationCards from './components/ConversationCards';
import TimelineView from './components/TimelineView';
import SearchBar from './components/SearchBar';
import AnimatedTransition from './components/AnimatedTransition';
import AnimatedLogo from './components/AnimatedLogo';
import ThemeToggle from './components/ThemeToggle';
import CommandPalette from './components/CommandPalette';
import { useConversations } from './hooks/useConversations';
import { useTokenBuffer } from './hooks/useTokenBuffer';
import { useCommandPalette } from './hooks/useCommandPalette';
import { ViewMode } from './types/appState';
import { Conversation, Message as ConversationMessage } from './types/conversation';

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
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
  const { isOpen: isCommandPaletteOpen, close: closeCommandPalette } = useCommandPalette();

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
    loadConversation,
    deleteConversation,
    searchConversations,
    loadConversations
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
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
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

    newSocket.on('message:saved', (data: { tempId: number; messageId: number; conversationId: number }) => {
      console.log('User message saved with ID:', data.messageId);
      setMessages(prev => {
        const updatedMessages = [...prev];
        // Update the last user message with the ID from database
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (updatedMessages[i].role === 'user' && !updatedMessages[i].id) {
            updatedMessages[i] = { ...updatedMessages[i], id: data.messageId };
            break;
          }
        }
        return updatedMessages;
      });
    });

    newSocket.on('chat:complete', (data: { message: string; messageId?: number; conversationId: number }) => {
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
      
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      if (socket) {
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

    newSocket.on('chat:error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
      setIsStreaming(false);
      setIsThinking(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (content: string) => {
    const userMessage = { 
      role: 'user' as const, 
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    if (socket) {
      socket.emit('chat:message', {
        messages: [...messages, userMessage],
        conversationId: currentConversationId
      });
    }
    
    if (viewMode !== ViewMode.CHAT) {
      setViewMode(ViewMode.CHAT);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setViewMode(ViewMode.CHAT);
    setInputValue('');
    resetBuffer();
  };

  const handleHomeClick = () => {
    setViewMode(ViewMode.CARDS);
    loadConversations();
  };

  const handleSelectConversation = (conversationId: number) => {
    loadConversation(conversationId);
  };

  const handleDeleteConversation = (conversationId: number) => {
    deleteConversation(conversationId);
    if (conversationId === currentConversationId) {
      handleNewChat();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (viewMode !== ViewMode.CHAT) {
      setViewMode(ViewMode.CHAT);
    }
  };

  const handleMessageEdit = (index: number, newContent: string) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, content: newContent } : msg
    ));
  };

  const commands = useMemo(() => [
    {
      id: 'new-chat',
      title: 'New Chat',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
      action: handleNewChat,
      category: 'Chat',
      keywords: ['create', 'start', 'fresh']
    },
    {
      id: 'clear-messages',
      title: 'Clear Messages',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
      action: () => setMessages([]),
      category: 'Chat',
      keywords: ['delete', 'remove', 'reset']
    },
    {
      id: 'view-cards',
      title: 'View All Conversations',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      action: () => setViewMode(ViewMode.CARDS),
      category: 'Navigation',
      keywords: ['home', 'browse', 'history']
    }
  ], []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        commands={commands}
      />

      <header className="glass-gradient glass-noise border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {viewMode === ViewMode.CHAT && messages.length > 0 ? (
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
              <AnimatedLogo size="medium" isActive={isStreaming} />
            )}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Chat Buddy AI
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
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
              <span className="text-sm text-gray-600 dark:text-gray-400">
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
              <EnhancedChatInput 
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
                      <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                          <EditableMessage
                            key={`msg-${index}-${message.timestamp?.getTime()}`}
                            role={message.role}
                            content={message.content}
                            timestamp={message.timestamp}
                            messageId={message.id}
                            socket={socket}
                            onEdit={(newContent) => handleMessageEdit(index, newContent)}
                          />
                        ))}
                        
                        {isThinking && <ThinkingAnimation />}
                        
                        {isStreaming && bufferedContent && (
                          <StreamingMessage
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
              
              <EnhancedChatInput 
                onSendMessage={sendMessage} 
                disabled={!connected || isStreaming} 
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