import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'message' | 'timeline';
  count?: number;
}

export default function SkeletonLoader({ variant = 'card', count = 6 }: SkeletonLoaderProps) {
  if (variant === 'message') {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="flex gap-3 p-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-60 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3 animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}