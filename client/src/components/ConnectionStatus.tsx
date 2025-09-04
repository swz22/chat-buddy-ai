import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  connected: boolean;
  retryCount: number;
  maxRetries: number;
  nextRetryIn?: number;
}

export default function ConnectionStatus({ 
  connected, 
  retryCount, 
  maxRetries,
  nextRetryIn 
}: ConnectionStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (!connected && retryCount > 0) {
      setShowDetails(true);
      const timer = setTimeout(() => setShowDetails(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [connected, retryCount]);

  const getStatusColor = () => {
    if (connected) return 'bg-green-500';
    if (retryCount >= maxRetries) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (connected) return 'Connected';
    if (retryCount >= maxRetries) return 'Connection failed';
    if (retryCount > 0) return `Reconnecting... (${retryCount}/${maxRetries})`;
    return 'Connecting...';
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className={`w-2 h-2 rounded-full ${getStatusColor()}`}
          animate={!connected ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </span>
      </motion.button>

      <AnimatePresence>
        {showDetails && !connected && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px] z-50"
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {getStatusText()}
                </span>
              </div>
              
              {retryCount > 0 && retryCount < maxRetries && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Attempt:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {retryCount} of {maxRetries}
                    </span>
                  </div>
                  
                  {nextRetryIn && nextRetryIn > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Next retry:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {Math.ceil(nextRetryIn / 1000)}s
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <motion.div
                        className="bg-blue-500 h-1 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(retryCount / maxRetries) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {retryCount >= maxRetries && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Please check your connection and refresh the page
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}