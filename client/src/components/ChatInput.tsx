import { useState, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, initialValue = '' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 glass-gradient glass-noise">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={disabled ? "Waiting for response..." : "Type your message..."}
              disabled={disabled}
              rows={1}
              className={`
                w-full resize-none rounded-xl px-4 py-3 
                glass-input
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                dark:text-gray-100 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                ${isFocused ? 'shadow-xl' : 'shadow-lg'}
              `}
              style={{ minHeight: '50px', maxHeight: '200px' }}
            />
            {message.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-2 bottom-2 text-xs text-gray-500 dark:text-gray-400"
              >
                {message.length} / 4000
              </motion.div>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${disabled || !message.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'glass-iridescent hover:shadow-lg hover:shadow-blue-500/25 text-white'
              }
            `}
            style={{
              background: disabled || !message.trim() ? '' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
        
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4"
          >
            <span><kbd className="px-2 py-1 glass rounded text-xs">Enter</kbd> to send</span>
            <span><kbd className="px-2 py-1 glass rounded text-xs">Shift+Enter</kbd> for new line</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}