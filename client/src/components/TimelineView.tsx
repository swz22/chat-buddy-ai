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
      react: '⚛️', help: '🆘', debug: '🐛', error: '❌', 
      css: '🎨', style: '🎨', animation: '✨', typescript: '📘',
      javascript: '📜', project: '🚀', idea: '💡', question: '❓',
      learn: '📚', code: '💻', api: '🔌', database: '🗄️', git: '🌳'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerTitle.includes(key)) return emoji;
    }
    return '💬';
  };

  if (conversations.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/50 dark:to-transparent border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Recent Conversations
          </h2>
          <div className="flex gap-1">
            {canScrollLeft && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToDirection('left')}
                className="p-1 rounded-lg bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
            {canScrollRight && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToDirection('right')}
                className="p-1 rounded-lg bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {conversations.slice(0, 15).map((conversation, index) => {
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
                onClick={() => onSelectConversation(conversation.id!)}
                className={`
                  relative flex-shrink-0 cursor-pointer rounded-xl
                  transition-all duration-200
                  flex items-start gap-3 p-3 min-w-[220px] max-w-[280px]
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-600 shadow-md' 
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTimelineIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full"
                  />
                )}
                
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'bg-white dark:bg-gray-800'
                  }
                `}>
                  <span className="text-lg">
                    {getEmoji(conversation.title)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${
                    isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {conversation.title}
                  </h4>
                  <div className={`text-xs mt-1 ${
                    isActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span>{timeAgo}</span>
                    {conversation.messageCount && conversation.messageCount > 0 && (
                      <span className="ml-2">• {conversation.messageCount} messages</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}