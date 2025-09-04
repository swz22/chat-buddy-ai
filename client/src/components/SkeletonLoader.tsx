import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'message' | 'timeline' | 'chat' | 'search';
  count?: number;
}

export default function SkeletonLoader({ variant = 'card', count = 6 }: SkeletonLoaderProps) {
  const shimmerTransition = {
    repeat: Infinity,
    duration: 1.5,
    ease: "linear" as const
  };

  if (variant === 'message') {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}
          >
            <div className="relative overflow-hidden w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: -200 }}
                animate={{ x: 200 }}
                transition={shimmerTransition}
              />
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative overflow-hidden h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: -200 }}
                  animate={{ x: 200 }}
                  transition={shimmerTransition}
                />
              </div>
              <div className="relative overflow-hidden h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: -200 }}
                  animate={{ x: 200 }}
                  transition={shimmerTransition}
                />
              </div>
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
            className="relative overflow-hidden flex-shrink-0 w-60 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: -200 }}
              animate={{ x: 200 }}
              transition={shimmerTransition}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="relative overflow-hidden h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: -200 }}
                animate={{ x: 200 }}
                transition={shimmerTransition}
              />
            </div>
            <div className="relative overflow-hidden h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: -200 }}
                animate={{ x: 200 }}
                transition={shimmerTransition}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center mb-2">
                  <div className="relative overflow-hidden w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: -200 }}
                      animate={{ x: 200 }}
                      transition={shimmerTransition}
                    />
                  </div>
                  <div className="relative overflow-hidden h-4 bg-gray-200 dark:bg-gray-700 rounded w-32">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: -200 }}
                      animate={{ x: 200 }}
                      transition={shimmerTransition}
                    />
                  </div>
                </div>
                <div className="relative overflow-hidden h-3 bg-gray-200 dark:bg-gray-700 rounded w-full">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: -200 }}
                    animate={{ x: 200 }}
                    transition={shimmerTransition}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (variant === 'search') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl mx-auto mb-6"
      >
        <div className="relative overflow-hidden h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"
            initial={{ x: -200 }}
            animate={{ x: 200 }}
            transition={shimmerTransition}
          />
        </div>
      </motion.div>
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
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative overflow-hidden w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: -200 }}
                    animate={{ x: 200 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear" as const,
                      delay: i * 0.1
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="relative overflow-hidden h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: -200 }}
                      animate={{ x: 200 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear" as const,
                        delay: i * 0.1 + 0.1
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="relative overflow-hidden h-3 bg-gray-200 dark:bg-gray-700 rounded w-full">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: -200 }}
                        animate={{ x: 200 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear" as const,
                          delay: i * 0.1 + 0.2
                        }}
                      />
                    </div>
                    <div className="relative overflow-hidden h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: -200 }}
                        animate={{ x: 200 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear" as const,
                          delay: i * 0.1 + 0.3
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-3">
                    <div className="relative overflow-hidden h-2 bg-gray-200 dark:bg-gray-700 rounded w-16">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: -200 }}
                        animate={{ x: 200 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear" as const,
                          delay: i * 0.1 + 0.4
                        }}
                      />
                    </div>
                    <div className="relative overflow-hidden h-2 bg-gray-200 dark:bg-gray-700 rounded w-20">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: -200 }}
                        animate={{ x: 200 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear" as const,
                          delay: i * 0.1 + 0.5
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}