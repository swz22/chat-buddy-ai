import { motion } from 'framer-motion';
import { messageVariants } from '../utils/animations';
import clsx from 'clsx';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function Message({ role, content }: MessageProps) {
  const isUser = role === 'user';
  
  return (
    <motion.div 
      className={clsx('flex', isUser ? 'justify-end' : 'justify-start', 'mb-4')}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      <motion.div
        className={clsx(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200/50 shadow-lg'
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </motion.div>
    </motion.div>
  );
}