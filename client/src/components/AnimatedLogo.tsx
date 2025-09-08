import { motion } from 'framer-motion';

export default function AnimatedLogo() {
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative w-10 h-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-white font-bold text-xl"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            AI
          </motion.span>
        </div>
      </motion.div>
      
      <div className="flex flex-col">
        <motion.h1 
          className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.02 }}
        >
          Chat Buddy AI
        </motion.h1>
        <motion.p 
          className="text-xs text-gray-600 dark:text-gray-400 -mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Powered by OpenAI
        </motion.p>
      </div>
    </motion.div>
  );
}