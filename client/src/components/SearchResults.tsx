import { motion } from 'framer-motion';
import { Conversation } from '../types/conversation';
import HighlightedText from './HighlightedText';
import { formatDistanceToNow } from '../utils/dateHelpers';

interface SearchResultsProps {
  conversations: Conversation[];
  query: string;
  onSelectConversation: (conversationId: number) => void;
  onClearSearch: () => void;
}

export default function SearchResults({
  conversations,
  query,
  onSelectConversation,
  onClearSearch
}: SearchResultsProps) {
  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No results found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          No conversations match "{query}"
        </p>
        <button
          onClick={onClearSearch}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear search
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Found {conversations.length} result{conversations.length !== 1 ? 's' : ''} for "{query}"
        </h3>
        <button
          onClick={onClearSearch}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear
        </button>
      </div>
      
      {conversations.map((conversation, index) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelectConversation(conversation.id!)}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                <HighlightedText text={conversation.title} query={query} />
              </h4>
              {conversation.lastMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  <HighlightedText text={conversation.lastMessage} query={query} />
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDistanceToNow(new Date(conversation.updated_at))}</span>
                {conversation.messageCount && (
                  <span>• {conversation.messageCount} messages</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}