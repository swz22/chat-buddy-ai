import { motion } from 'framer-motion';

export default function ThinkingAnimation() {
  return (
    <motion.div
      className="flex gap-3 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0">
        <motion.div 
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
          animate={{
            rotate: [0, 360],
            boxShadow: [
              '0 10px 15px -3px rgba(59, 130, 246, 0.5)',
              '0 10px 25px -3px rgba(147, 51, 234, 0.5)',
              '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
            ]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </motion.div>
      </div>
      
      <div className="flex-1 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <motion.span 
              className="text-sm text-gray-500 dark:text-gray-400 italic"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Thinking...
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}