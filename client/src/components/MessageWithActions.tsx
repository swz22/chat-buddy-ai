import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { messageVariants } from '../utils/animations';
import MarkdownMessage from './MarkdownMessage';
import clsx from 'clsx';

interface MessageWithActionsProps {
  role: 'user' | 'assistant';
  content: string;
  onDelete?: () => void;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export default function MessageWithActions({ 
  role, 
  content, 
  onDelete, 
  onRegenerate,
  isLast 
}: MessageWithActionsProps) {
  const isUser = role === 'user';
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className={clsx('flex', isUser ? 'justify-end' : 'justify-start', 'mb-4 group')}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <div className="relative max-w-xs sm:max-w-md lg:max-w-2xl xl:max-w-3xl">
        <motion.div
          className={clsx(
            'px-4 py-2.5 rounded-2xl',
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20'
              : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 shadow-lg'
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <MarkdownMessage content={content} isUser={isUser} />
        </motion.div>

        <AnimatePresence>
          {showActions && (
            <motion.div
              className={clsx(
                'absolute -bottom-8 flex gap-1',
                isUser ? 'right-0' : 'left-0'
              )}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleCopy}
                className="px-2 py-1 text-xs bg-gray-700/90 dark:bg-gray-600/90 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-500 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </motion.button>

              {!isUser && isLast && onRegenerate && (
                <motion.button
                  onClick={onRegenerate}
                  className="px-2 py-1 text-xs bg-blue-600/90 text-white rounded-md hover:bg-blue-700 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Regenerate
                </motion.button>
              )}

              {onDelete && (
                <motion.button
                  onClick={onDelete}
                  className="px-2 py-1 text-xs bg-red-600/90 text-white rounded-md hover:bg-red-700 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}