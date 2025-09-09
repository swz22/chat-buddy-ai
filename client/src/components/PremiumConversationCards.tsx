import { motion } from 'framer-motion';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from '../utils/dateHelpers';

interface PremiumConversationCardsProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: number) => void;
  onDeleteConversation: (conversationId: number) => void;
  loading: boolean;
}

export default function PremiumConversationCards({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  loading
}: PremiumConversationCardsProps) {
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

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-blue-500/10 to-purple-500/10',
      'from-purple-500/10 to-pink-500/10',
      'from-green-500/10 to-blue-500/10',
      'from-orange-500/10 to-red-500/10',
      'from-indigo-500/10 to-purple-500/10',
    ];
    return gradients[index % gradients.length];
  };

  const groupConversationsByDate = (convs: Conversation[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: Record<string, Conversation[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': []
    };

    convs.forEach(conv => {
      const date = new Date(conv.updated_at);
      if (date.toDateString() === today.toDateString()) {
        groups['Today'].push(conv);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(conv);
      } else if (date > thisWeek) {
        groups['This Week'].push(conv);
      } else {
        groups['Earlier'].push(conv);
      }
    });

    return Object.entries(groups).filter(([_, convs]) => convs.length > 0);
  };

  const conversationGroups = groupConversationsByDate(conversations);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {conversationGroups.map(([period, convs]) => (
        <div key={period} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
            <span className="px-3">{period}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convs.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <button
                    onClick={() => onSelectConversation(conv.id!)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl shadow-inner">
                        {getEmoji(conv.title)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                          {conv.title}
                        </h3>
                        
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                            {conv.lastMessage}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDistanceToNow(new Date(conv.updated_at))}
                          </span>
                          
                          {conv.messageCount && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {conv.messageCount} messages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id!);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}