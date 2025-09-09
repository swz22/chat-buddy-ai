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
                onClick={() => scrollToDirection('left')}
                className="p-1 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
            {canScrollRight && (
              <motion.button
                onClick={() => scrollToDirection('right')}
                className="p-1 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
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
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {conversations.slice(0, 20).map((conversation, index) => (
            <motion.div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg cursor-pointer transition-all
                ${currentConversationId === conversation.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getEmoji(conversation.title)}</span>
                <div className="min-w-0">
                  <h3 className={`text-sm font-medium truncate max-w-[150px] ${
                    currentConversationId === conversation.id 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {conversation.title}
                  </h3>
                  <p className={`text-xs ${
                    currentConversationId === conversation.id 
                      ? 'text-white/80' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatDistanceToNow(new Date(conversation.updated_at))}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}