import { motion } from 'framer-motion';
import { typingVariants } from '../utils/animations';

export default function ThinkingAnimation() {
  return (
    <motion.div
      className="flex gap-3 mb-6"
      variants={typingVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking</span>
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0
                }}
              />
              <motion.div
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.2
                }}
              />
              <motion.div
                className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.4
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}