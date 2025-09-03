import { useState, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, initialValue = '' }: ChatInputProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Waiting for response..." : "Type your message..."}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '50px', maxHeight: '200px' }}
          />
          
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${disabled || !message.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}