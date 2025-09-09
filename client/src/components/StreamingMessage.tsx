import { motion } from 'framer-motion';

interface StreamingMessageProps {
  content: string;
  isComplete?: boolean;
}

export default function StreamingMessage({ content, isComplete = false }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
        AI
      </div>
      <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{content}</p>
        {!isComplete && (
          <motion.span
            className="inline-block w-2 h-4 bg-blue-500 dark:bg-blue-400 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}