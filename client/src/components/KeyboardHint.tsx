import { motion } from 'framer-motion';

interface KeyboardHintProps {
  keys: string[];
  onClick?: () => void;
  label?: string;
}

export default function KeyboardHint({ keys, onClick, label }: KeyboardHintProps) {
  return (
    <motion.button
      onClick={onClick}
      className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 shadow-sm"
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