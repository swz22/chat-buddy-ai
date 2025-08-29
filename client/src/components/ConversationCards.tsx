import { motion, AnimatePresence } from 'framer-motion';
import { Conversation, Message } from '../types/conversation';
import { formatDistanceToNow } from '../utils/dateHelpers';

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
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: []
    };

    convs.forEach(conv => {
      const convDate = new Date(conv.updated_at);
      if (convDate.toDateString() === today.toDateString()) {
        groups.Today.push(conv);
      } else if (convDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(conv);
      } else if (convDate > thisWeek) {
        groups['This Week'].push(conv);
      } else {
        groups.Earlier.push(conv);
      }
    });

    return groups;
  };

  const groups = groupConversationsByDate(conversations);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No conversations yet</h2>
        <p className="text-gray-600">Start a new chat to begin!</p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <AnimatePresence mode="wait">
        {Object.entries(groups).map(([groupName, groupConvs]) => {
          if (groupConvs.length === 0) return null;
          
          return (
            <div key={groupName} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 px-1">
                {groupName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupConvs.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="relative group"
                  >
                    <div
                      onClick={() => onSelectConversation(conversation.id)}
                      className="bg-white rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-400 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start mb-3">
                        <span className="text-2xl mr-3">{getEmoji(conversation.title)}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">
                            {conversation.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTimeAgo(conversation.updated_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 line-clamp-3">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 mb-2">
                          <span className="text-xs text-blue-600">You:</span>
                          <p className="text-xs mt-1">How can I implement this feature...</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <span className="text-xs text-gray-600">AI:</span>
                          <p className="text-xs mt-1">Here's a great approach to...</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}