import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import SkeletonLoader from './SkeletonLoader';
import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a haiku about programming",
    "What are the latest AI trends?",
    "Help me debug my React code"
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  if (isLoading) {
    return <SkeletonLoader variant="chat" />;
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full px-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div className="max-w-2xl text-center" variants={fadeInUp}>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Welcome to Chat Buddy AI
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your intelligent conversational companion powered by OpenAI
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          <motion.div 
            className="text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Real-time Streaming</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Experience instant responses with token-by-token streaming
            </p>
          </motion.div>

          <motion.div 
            className="text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Smart Persistence</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All conversations are automatically saved and searchable
            </p>
          </motion.div>

          <motion.div 
            className="text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Beautiful UI</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Modern glassmorphism design with smooth animations
            </p>
          </motion.div>

          <motion.div 
            className="text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Flexible Views</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Switch between card and timeline views seamlessly
            </p>
          </motion.div>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}