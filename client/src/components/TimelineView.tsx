import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from '../utils/dateHelpers';

interface TimelineViewProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export default function TimelineView({
  conversations,
  currentConversationId,
  onSelectConversation,
  isExpanded,
  onToggleExpanded
}: TimelineViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const progress = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(Math.min(1, Math.max(0, progress)));
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [conversations]);

  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const getEmoji = (title: string) => {
    const emojiMap: Record<string, string> = {
      react: '⚛️',
      help: '🆘',
      debug: '🐛',
      error: '❌',
      css: '🎨',
      style: '🎨',
      animation: '✨',
      typescript: '📘',
      javascript: '📜',
      project: '🚀',
      idea: '💡',
      question: '❓',
      learn: '📚',
      code: '💻',
      api: '🔌',
      database: '🗄️',
      git: '🌳'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerTitle.includes(key)) return emoji;
    }
    return '💬';
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: isExpanded ? 140 : 100, 
        opacity: 1 
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-700/50 shadow-2xl"
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
      
      {/* Expand/Collapse button */}
      <button
        onClick={onToggleExpanded}
        className="absolute right-4 top-3 z-20 p-1.5 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
      >
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="w-4 h-4 text-gray-400 hover:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <div className="relative h-full px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Conversations
          </h3>
          <span className="text-xs text-gray-500">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>
        
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scrollToDirection('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-gray-800/90 hover:bg-gray-700 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {canScrollRight && (
          <button
            onClick={() => scrollToDirection('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-gray-800/90 hover:bg-gray-700 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {conversations.length > 0 ? (
            conversations.slice(0, 15).map((conversation, index) => {
              const isActive = conversation.id === currentConversationId;
              const timeAgo = formatDistanceToNow(new Date(conversation.updated_at));
              
              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    relative flex-shrink-0 w-52 cursor-pointer rounded-xl p-3.5
                    transition-all duration-300 backdrop-blur-sm border
                    ${isActive 
                      ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border-blue-400/50 shadow-xl shadow-blue-500/10' 
                      : 'bg-gray-800/60 hover:bg-gray-700/60 border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-glow"
                    />
                  )}
                  
                  <div className="flex items-start gap-3">
                    <span className={`text-xl ${isActive ? 'animate-pulse' : ''}`}>
                      {getEmoji(conversation.title)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate ${
                        isActive ? 'text-white' : 'text-gray-200'
                      }`}>
                        {conversation.title}
                      </h4>
                      {isExpanded && (
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                          Click to continue this conversation...
                        </p>
                      )}
                      <div className={`text-xs mt-2 ${
                        isActive ? 'text-blue-300' : 'text-gray-500'
                      }`}>
                        {timeAgo}
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 animate-pulse pointer-events-none" />
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="flex items-center justify-center w-full text-gray-500 text-sm py-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📭</div>
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Start chatting to see your history here</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced scroll progress indicator */}
        {conversations.length > 3 && (
          <div className="absolute bottom-1 left-4 right-4">
            <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full relative"
                style={{ width: '25%' }}
                animate={{ x: `${scrollProgress * 300}%` }}
                transition={{ type: 'spring', damping: 30 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-sm" />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}