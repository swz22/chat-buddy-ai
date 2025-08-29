import { motion } from 'framer-motion';
import { typingVariants } from '../utils/animations';

export default function TypingIndicator() {
  return (
    <motion.div 
      className="flex justify-start mb-4"
      variants={typingVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="glass-morphism rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex space-x-1.5">
          <motion.div 
            className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
          />
          <motion.div 
            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          <motion.div 
            className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}