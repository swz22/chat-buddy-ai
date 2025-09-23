import { useState, useRef, useEffect } from 'react';
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
  placeholder = "Message Chat Buddy AI...",
  value: externalValue,
  onChange: externalOnChange
}: EnhancedChatInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const value = externalValue !== undefined ? externalValue : internalValue;
  const onChange = externalOnChange || ((v: string) => setInternalValue(v));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isComposing && value.trim() && !disabled) {
      onSendMessage(value.trim());
      onChange('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -top-12 left-0 text-xs text-gray-500 dark:text-gray-400 
                     bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 
                     rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
          >
            Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd> to send, 
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded ml-1">Shift+Enter</kbd> for new line
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative flex items-end gap-2 bg-white dark:bg-gray-800 rounded-2xl 
                    border-2 transition-all duration-200 shadow-lg
                    ${isFocused 
                      ? 'border-blue-500 dark:border-blue-400 shadow-blue-500/20' 
                      : 'border-gray-200 dark:border-gray-700 shadow-gray-200/20'
                    }`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent px-4 py-3 resize-none outline-none 
                   text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          style={{ minHeight: '24px', maxHeight: '200px' }}
        />

        <div className="flex items-end gap-2 p-2">
          <motion.button
            type="submit"
            disabled={disabled || !value.trim()}
            className={`p-2 rounded-xl transition-all duration-200 ${
              value.trim() && !disabled
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            whileHover={value.trim() && !disabled ? { scale: 1.05 } : {}}
            whileTap={value.trim() && !disabled ? { scale: 0.95 } : {}}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
              />
            </svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-6 right-0 text-xs text-gray-400 dark:text-gray-500"
          >
            {value.length} characters
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}