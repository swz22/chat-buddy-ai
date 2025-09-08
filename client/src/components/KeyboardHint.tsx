import { motion } from 'framer-motion';

interface KeyboardHintProps {
  keys?: string[];
  onClick?: () => void;
  label?: string;
  className?: string;
}

export default function KeyboardHint({ 
  keys = ['⌘', 'K'], 
  onClick, 
  label = 'Command',
  className = ''
}: KeyboardHintProps) {
  // Ensure keys is always an array
  const keysArray = Array.isArray(keys) ? keys : [keys];
  
  // Don't render if no keys
  if (keysArray.length === 0) {
    return null;
  }

  return (
    <motion.button
      onClick={onClick}
      className={`hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Keyboard shortcut: ${keysArray.join(' + ')}`}
    >
      <div className="flex items-center gap-1">
        {keysArray.map((key, index) => (
          <kbd
            key={`${key}-${index}`}
            className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 shadow-sm font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
      {label && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </motion.button>
  );
}