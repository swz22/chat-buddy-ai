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
      'bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/20 dark:from-emerald-400/25 dark:via-teal-400/20 dark:to-cyan-400/25',
      'bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/20 dark:from-blue-400/25 dark:via-indigo-400/20 dark:to-purple-400/25',
      'bg-gradient-to-br from-purple-400/20 via-pink-400/15 to-rose-400/20 dark:from-purple-400/25 dark:via-pink-400/20 dark:to-rose-400/25',
      'bg-gradient-to-br from-orange-400/20 via-amber-400/15 to-yellow-400/20 dark:from-orange-400/25 dark:via-amber-400/20 dark:to-yellow-400/25',
      'bg-gradient-to-br from-rose-400/20 via-pink-400/15 to-fuchsia-400/20 dark:from-rose-400/25 dark:via-pink-400/20 dark:to-fuchsia-400/25',
      'bg-gradient-to-br from-cyan-400/20 via-sky-400/15 to-blue-400/20 dark:from-cyan-400/25 dark:via-sky-400/20 dark:to-blue-400/25',
      'bg-gradient-to-br from-lime-400/20 via-green-400/15 to-emerald-400/20 dark:from-lime-400/25 dark:via-green-400/20 dark:to-emerald-400/25',
      'bg-gradient-to-br from-fuchsia-400/20 via-purple-400/15 to-violet-400/20 dark:from-fuchsia-400/25 dark:via-purple-400/20 dark:to-violet-400/25',
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

  const getPreviewText = (conversation: Conversation) => {
    if (conversation.lastMessage) {
      const preview = conversation.lastMessage.substring(0, 100);
      return preview.length < conversation.lastMessage.length ? `${preview}...` : preview;
    }
    return 'No messages yet';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-40"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="text-6xl mb-4">💭</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start a new chat to begin your journey
        </p>
      </div>
    );
  }

  const groupedConversations = groupConversationsByDate(conversations);
  let globalIndex = 0;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-6 max-w-[1600px] mx-auto">
        {groupedConversations.map(([groupName, groupConvs]) => (
          <div key={groupName} className="mb-8">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupConvs.map((conversation) => {
                const cardIndex = globalIndex++;
                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: cardIndex * 0.05 }}
                    whileHover={{ 
                      y: -6,
                      transition: { duration: 0.2 }
                    }}
                    className="group"
                  >
                    <div
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`
                        relative h-full min-h-[140px] p-4
                        ${getGradientClass(cardIndex)}
                        backdrop-blur-sm
                        border border-white/20 dark:border-white/10
                        rounded-xl cursor-pointer
                        shadow-lg hover:shadow-2xl
                        transition-all duration-200
                        overflow-hidden
                        dark:bg-gray-900/50
                      `}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 
                                 bg-white/80 dark:bg-gray-800/80 backdrop-blur
                                 text-gray-500 hover:text-red-500 
                                 rounded-lg transition-all duration-200 z-10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Card content */}
                      <div className="flex flex-col h-full">
                        {/* Header with emoji and title */}
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl flex-shrink-0">{getEmoji(conversation.title)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 
                                         line-clamp-2 break-words mb-1">
                              {conversation.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(conversation.updated_at))} ago
                            </p>
                          </div>
                        </div>

                        {/* Preview text */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 
                                    line-clamp-2 break-words flex-1">
                          {getPreviewText(conversation)}
                        </p>

                        {/* Footer with message count */}
                        {conversation.messageCount !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <span>{conversation.messageCount} messages</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                    pointer-events-none rounded-xl" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}