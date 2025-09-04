import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  emoji: string;
  label: string;
  count: number;
  active: boolean;
}

interface MessageReactionsProps {
  messageId?: string;
  onReaction?: (emoji: string, action: 'add' | 'remove') => void;
}

export default function MessageReactions({ onReaction }: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: '👍', label: 'Like', count: 0, active: false },
    { emoji: '❤️', label: 'Love', count: 0, active: false },
    { emoji: '🎉', label: 'Celebrate', count: 0, active: false },
    { emoji: '🤔', label: 'Thinking', count: 0, active: false },
    { emoji: '😮', label: 'Surprised', count: 0, active: false }
  ]);
  
  const [showPicker, setShowPicker] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const toggleReaction = (emoji: string) => {
    setReactions(prev => prev.map(r => {
      if (r.emoji === emoji) {
        const newActive = !r.active;
        const newCount = newActive ? r.count + 1 : Math.max(0, r.count - 1);
        onReaction?.(emoji, newActive ? 'add' : 'remove');
        return { ...r, active: newActive, count: newCount };
      }
      return r;
    }));
    setShowPicker(false);
  };

  const submitFeedback = () => {
    if (feedback.trim()) {
      console.log('Feedback submitted:', feedback);
      setFeedback('');
      setShowFeedback(false);
    }
  };

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="relative flex items-center gap-2 mt-2">
      {activeReactions.length > 0 && (
        <div className="flex gap-1">
          {activeReactions.map(reaction => (
            <motion.button
              key={reaction.emoji}
              onClick={() => toggleReaction(reaction.emoji)}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs
                ${reaction.active 
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                  : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                }
                hover:scale-105 transition-all
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <div className="relative">
        <motion.button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full mb-2 left-0 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="flex gap-1">
                {reactions.map(reaction => (
                  <motion.button
                    key={reaction.emoji}
                    onClick={() => toggleReaction(reaction.emoji)}
                    className={`
                      p-2 rounded-lg transition-all
                      ${reaction.active 
                        ? 'bg-blue-50 dark:bg-blue-900/30' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title={reaction.label}
                  >
                    <span className="text-xl">{reaction.emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={() => setShowFeedback(!showFeedback)}
        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Provide feedback"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full mb-2 right-0 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-64"
          >
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your feedback..."
              className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}