import { motion } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from '../utils/dateHelpers';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isOpen,
  onClose
}: SidebarProps) {
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

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <AnimatedLogo />
        </div>
        
        <div className="p-4">
          <motion.button
            onClick={onNewChat}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </motion.button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Recent Conversations
          </h3>
          
          <div className="space-y-2">
            {conversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id!)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">{getEmoji(conv.title)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conv.updated_at))}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.aside>
    </>
  );
}