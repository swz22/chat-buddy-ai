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
  const setValue = (newValue: string) => {
    if (externalOnChange) {
      externalOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  };

  const handleSubmit = () => {
    if (!value.trim() || disabled || isComposing) return;
    
    onSendMessage(value.trim());
    setValue('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    { icon: '💡', text: 'Explain a concept' },
    { icon: '💻', text: 'Write code' },
    { icon: '📝', text: 'Help with writing' },
    { icon: '🔍', text: 'Research a topic' }
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        <AnimatePresence>
          {value.length === 0 && !isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 mb-3 flex-wrap"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setValue(suggestion.text)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`relative flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 transition-all ${
          isFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
        }`}>
          <div className="flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '24px', maxHeight: '200px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {value.length}
              </span>
            )}
            
            <motion.button
              whileHover={{ scale: disabled || !value.trim() ? 1 : 1.1 }}
              whileTap={{ scale: disabled || !value.trim() ? 1 : 0.9 }}
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              className={`p-2 rounded-lg transition-all ${
                value.trim() && !disabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {disabled && (
            <span className="text-yellow-600 dark:text-yellow-400">
              Connecting...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}