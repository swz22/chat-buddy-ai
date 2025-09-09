import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function EnhancedChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  value: controlledValue,
  onChange
}: EnhancedChatInputProps) {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const value = controlledValue !== undefined ? controlledValue : localValue;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setLocalValue(newValue);
    }
    
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSendMessage(value.trim());
      if (!controlledValue) {
        setLocalValue('');
      }
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4">
      <motion.div
        className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl transition-all duration-300 ${
          isFocused 
            ? 'shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-400/10' 
            : 'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50'
        }`}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity duration-300 ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`} style={{ padding: '1px' }}>
          <div className="h-full w-full rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl" />
        </div>
        
        <div className="relative flex items-end gap-2 p-4">
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-8 left-4 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full"
              >
                <span className="flex items-center gap-1">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    ●
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  >
                    ●
                  </motion.span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-base leading-relaxed"
            style={{ minHeight: '24px', maxHeight: '200px' }}
          />
          
          <motion.button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className={`p-3 rounded-xl transition-all duration-200 ${
              value.trim() && !disabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            whileHover={value.trim() && !disabled ? { scale: 1.05 } : {}}
            whileTap={value.trim() && !disabled ? { scale: 0.95 } : {}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
      
      <div className="flex items-center justify-between mt-2 px-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}