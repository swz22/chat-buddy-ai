import { motion } from 'framer-motion';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from '../utils/dateHelpers';
import SkeletonLoader from './SkeletonLoader';

interface ConversationCardsProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: number) => void;
  onDeleteConversation: (conversationId: number) => void;
  loading: boolean;
}

export default function ConversationCards({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  loading
}: ConversationCardsProps) {
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

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date));
    } catch {
      return 'recently';
    }
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

  if (loading) {
    return <SkeletonLoader variant="card" count={6} />;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-sm text-center">Start a new chat to begin your AI journey</p>
      </div>
    );
  }

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <div className="p-6 overflow-y-auto">
      {groupedConversations.map(([group, convs], groupIndex) => (
        <div key={group} className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {group}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convs.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => onSelectConversation(conversation.id)}
                className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4 group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{getEmoji(conversation.title)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate mb-1">
                      {conversation.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {conversation.title.length > 50 ? conversation.title.slice(0, 50) + '...' : 'Start typing to begin...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{getTimeAgo(conversation.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}