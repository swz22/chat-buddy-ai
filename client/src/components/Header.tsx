import { motion } from 'framer-motion';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  connected: boolean;
}

export default function Header({ connected }: HeaderProps) {
  return (
    <motion.header 
      className="glass-morphism border-b border-white/10 dark:border-white/5 px-4 py-3 shadow-lg relative z-10 dark:bg-black/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gradient dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
              Chat Buddy AI
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Powered by GPT-3.5 Turbo</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              <motion.div
                className={clsx(
                  'w-3 h-3 rounded-full',
                  connected ? 'bg-green-500' : 'bg-red-500'
                )}
                animate={connected ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className={clsx(
                  'absolute inset-0 w-3 h-3 rounded-full',
                  connected ? 'bg-green-500' : 'bg-red-500'
                )}
                animate={connected ? {
                  scale: [1, 2, 2],
                  opacity: [0.7, 0, 0]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </div>
            <span className={clsx(
              'text-sm font-medium',
              connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}