import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import WelcomeScreen from './components/WelcomeScreen';
import ConnectionStatus from './components/ConnectionStatus';
import ConversationCards from './components/ConversationCards';
import TimelineView from './components/TimelineView';
import SearchBar from './components/SearchBar';
import AnimatedTransition from './components/AnimatedTransition';
import { useConversations } from './hooks/useConversations';
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
  const [streamingContent, setStreamingContent] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CARDS);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [messages, streamingContent, isStreaming]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
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
      setIsStreaming(true);
      setStreamingContent('');
    });

    newSocket.on('chat:token', (data: { token: string }) => {
      setStreamingContent(prev => prev + data.token);
    });

    newSocket.on('chat:complete', (data: { message: string; conversationId: number }) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      setIsStreaming(false);
      setStreamingContent('');
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      loadConversations();
    });

    newSocket.on('chat:error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
      setIsStreaming(false);
      setStreamingContent('');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ ' + (data.error || 'Sorry, I encountered an error. Please try again.') 
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
  }, []);

  const sendMessage = (content: string) => {
    if (!socket || !connected) return;

    const newMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

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
    setStreamingContent('');
    setIsStreaming(false);
    setCurrentConversationId(null);
    setViewMode(ViewMode.CARDS);
  };

  const handleHomeClick = () => {
    setViewMode(ViewMode.CARDS);
  };

  const toggleTimeline = () => {
    setIsTimelineExpanded(!isTimelineExpanded);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setViewMode(prev => prev === ViewMode.CARDS ? ViewMode.CHAT : ViewMode.CARDS);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ConnectionStatus connected={connected} />
      
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHomeClick}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </motion.button>
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
            
            <div className="text-xs text-gray-500 border-l pl-4">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘K</kbd> to toggle views
            </div>
            
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
          isExpanded={isTimelineExpanded}
          onToggleExpanded={toggleTimeline}
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
              />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4">
                  {messages.length === 0 && !isStreaming ? (
                    <WelcomeScreen />
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
              <ChatInput 
                onSendMessage={sendMessage} 
                disabled={!connected || isStreaming} 
              />
            </div>
          )}
        </AnimatedTransition>
      </main>
    </div>
  );
}

export default App;