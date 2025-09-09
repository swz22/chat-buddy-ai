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
      'from-emerald-500/10 to-teal-500/10',
      'from-teal-500/10 to-cyan-500/10',
      'from-cyan-500/10 to-blue-500/10',
      'from-orange-500/10 to-amber-500/10',
      'from-amber-500/10 to-yellow-500/10',
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
      const preview = conversation.lastMessage.substring(0, 120);
      return preview.length < conversation.lastMessage.length ? `${preview}...` : preview;
    }
    return 'No messages yet';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
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
    <div className="p-6 max-w-7xl mx-auto overflow-y-auto">
      {groupedConversations.map(([groupName, groupConvs]) => (
        <div key={groupName} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {groupName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupConvs.map((conversation) => {
              const cardIndex = globalIndex++;
              return (
                <motion.div
                  key={conversation.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cardIndex * 0.05 }}
                  className={`group relative bg-gradient-to-br ${getGradientClass(cardIndex)} backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 dark:hover:border-emerald-400/50`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEmoji(conversation.title)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {conversation.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(conversation.updated_at))}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {getPreviewText(conversation)}
                    </p>
                    {conversation.messageCount !== undefined && (
                      <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {conversation.messageCount} messages
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}