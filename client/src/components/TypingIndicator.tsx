import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  userName?: string;
}

export default function TypingIndicator({ userName = 'AI' }: TypingIndicatorProps) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <span className="italic">{userName} is typing...</span>
    </motion.div>
  );
}