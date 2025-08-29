import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
}

export default function ScrollToBottom({ show, onClick }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={onClick}
          className="fixed bottom-24 right-6 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <svg 
            className="w-5 h-5 text-gray-600 dark:text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/20"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}