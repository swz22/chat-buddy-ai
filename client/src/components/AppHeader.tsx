import { motion } from 'framer-motion';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import KeyboardHint from './KeyboardHint';

interface AppHeaderProps {
  onNewChat: () => void;
  onToggleCommandPalette: () => void;
  viewMode?: 'cards' | 'timeline' | 'chat';
}

export default function AppHeader({ 
  onNewChat, 
  onToggleCommandPalette,
  viewMode = 'cards'
}: AppHeaderProps) {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Chat Buddy AI
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                Powered by OpenAI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {viewMode === 'cards' && (
              <KeyboardHint 
                keys={['⌘', 'K']}
                onClick={onToggleCommandPalette}
                label="Command"
              />
            )}
            
            <motion.button
              onClick={onNewChat}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Chat
            </motion.button>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}