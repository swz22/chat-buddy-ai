import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from '../utils/dateHelpers';

interface TimelineViewProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
}

export default function TimelineView({
  conversations,
  currentConversationId,
  onSelectConversation
}: TimelineViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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
    const scrollAmount = 250;
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
      git: '🌳',
      penne: '🍝',
      pasta: '🍝',
      food: '🍕',
      recipe: '👨‍🍳',
      antonym: '🔄',
      discord: '💬',
      word: '📝',
      vodka: '🍸'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerTitle.includes(key)) return emoji;
    }
    return '💬';
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative bg-white border-b border-gray-200 shadow-sm"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Conversations
          </h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
            {conversations.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="relative px-6 pb-4">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => scrollToDirection('left')}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all hover:shadow-lg border border-gray-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
        
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => scrollToDirection('right')}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all hover:shadow-lg border border-gray-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
        
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide py-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {conversations.length > 0 ? (
            conversations.slice(0, 15).map((conversation, index) => {
              const isActive = conversation.id === currentConversationId;
              const timeAgo = formatDistanceToNow(new Date(conversation.updated_at));
              
              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    relative flex-shrink-0 cursor-pointer rounded-xl
                    transition-all duration-200
                    flex items-start gap-3 p-3 min-w-[220px] max-w-[280px]
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTimelineIndicator"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full"
                    />
                  )}
                  
                  {/* Emoji with background */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-white'
                    }
                  `}>
                    <span className="text-lg">
                      {getEmoji(conversation.title)}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${
                      isActive ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {conversation.title}
                    </h4>
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {timeAgo}
                    </div>
                  </div>

                  {/* Active badge */}
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="flex items-center justify-center w-full text-gray-400 text-sm py-8">
              <div className="text-center">
                <div className="text-2xl mb-2 opacity-50">💭</div>
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">Start chatting to see your history here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}