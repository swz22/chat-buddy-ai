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
      git: '🌳',
      penne: '🍝',
      pasta: '🍝',
      food: '🍕',
      recipe: '👨‍🍳',
      antonym: '🔄',
      discord: '💬',
      word: '📝'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerTitle.includes(key)) return emoji;
    }
    return '💬';
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-700/50 shadow-2xl h-[90px]"
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      {/* Header Section */}
      <div className="relative flex items-center justify-between px-4 pt-2.5 pb-1.5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Recent Conversations
        </h3>
        
        {/* Chat count badge */}
        <div className="flex items-center gap-1.5 bg-gray-800/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-700/50">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-300 font-medium">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="relative px-4 pb-2">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scrollToDirection('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-gray-800/90 hover:bg-gray-700 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg border border-gray-700/50"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
        
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scrollToDirection('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-gray-800/90 hover:bg-gray-700 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg border border-gray-700/50"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
        
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {conversations.length > 0 ? (
            conversations.slice(0, 15).map((conversation, index) => {
              const isActive = conversation.id === currentConversationId;
              const timeAgo = formatDistanceToNow(new Date(conversation.updated_at));
              
              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    relative flex-shrink-0 cursor-pointer rounded-lg
                    transition-all duration-300 backdrop-blur-sm border
                    flex items-center gap-2.5 px-3 py-2 min-w-[200px] max-w-[260px] h-[46px]
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500/25 to-purple-500/25 border-blue-400/60 shadow-lg shadow-blue-500/10' 
                      : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50 hover:border-gray-600'
                    }
                  `}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"
                    >
                      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
                    </motion.div>
                  )}
                  
                  {/* Emoji */}
                  <span className={`text-lg flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`}>
                    {getEmoji(conversation.title)}
                  </span>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className={`text-xs font-medium truncate ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}>
                      {conversation.title}
                    </h4>
                    <div className={`text-[10px] mt-0.5 ${
                      isActive ? 'text-blue-300' : 'text-gray-500'
                    }`}>
                      {timeAgo}
                    </div>
                  </div>

                  {/* Active glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 pointer-events-none" />
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="flex items-center justify-center w-full text-gray-500 text-sm h-[46px]">
              <div className="text-center">
                <div className="text-xl mb-1">📭</div>
                <p className="text-xs">No conversations yet</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced scroll progress indicator */}
        {conversations.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-0.5 bg-gray-700/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{ width: '20%' }}
                animate={{ x: `${scrollProgress * 400}%` }}
                transition={{ type: 'spring', damping: 30 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full" />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}