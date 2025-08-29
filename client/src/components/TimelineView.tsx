import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const progress = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(Math.min(1, Math.max(0, progress)));
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
      code: '💻'
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
        height: isExpanded ? 120 : 80, 
        opacity: 1 
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      
      <button
        onClick={onToggleExpanded}
        className="absolute right-4 top-2 z-20 p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <div className="relative h-full px-4 py-3">
        <div className="text-xs text-gray-400 mb-2 font-medium tracking-wider uppercase">
          Recent Conversations
        </div>
        
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence mode="popLayout">
            {conversations.slice(0, 10).map((conversation, index) => {
              const isActive = conversation.id === currentConversationId;
              const timeAgo = formatDistanceToNow(new Date(conversation.updated_at));
              
              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    relative flex-shrink-0 w-48 cursor-pointer rounded-lg p-3
                    transition-all duration-300 backdrop-blur-sm
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/50' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    />
                  )}
                  
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getEmoji(conversation.title)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-medium truncate ${
                        isActive ? 'text-white' : 'text-gray-200'
                      }`}>
                        {conversation.title}
                      </h4>
                      {isExpanded && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          Last message preview would go here...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-xs mt-1 ${
                    isActive ? 'text-blue-300' : 'text-gray-500'
                  }`}>
                    {timeAgo}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {conversations.length === 0 && (
            <div className="flex items-center justify-center w-full text-gray-500 text-sm">
              No conversations yet
            </div>
          )}
        </div>
        
        <div className="absolute bottom-2 left-4 right-4">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ x: `${scrollProgress * 100}%` }}
              style={{ width: '30%' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}