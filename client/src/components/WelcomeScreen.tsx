import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import SkeletonLoader from './SkeletonLoader';
import { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a haiku about programming",
    "What are the latest AI trends?",
    "Help me debug my React code"
  ];

  const { displayedText, isTyping, start } = useTypewriter({
    text: selectedSuggestion || '',
    speed: 30,
    onComplete: () => {
      if (selectedSuggestion && onSuggestionClick) {
        setTimeout(() => {
          onSuggestionClick(selectedSuggestion);
        }, 200);
      }
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    start();
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Watch responses appear with smooth animations</p>
          </motion.div>
          
          <motion.div 
            className="text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Smart Context</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI that understands and remembers context</p>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Modern interface with smooth animations</p>
          </motion.div>
          
          <motion.div 
            className="text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Persistent History</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All conversations saved and searchable</p>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-10 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Try asking:</p>
          
          {isTyping ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full"
            >
              <span className="font-medium">{displayedText}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-blue-600 dark:bg-blue-400 ml-1"
              />
            </motion.div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}