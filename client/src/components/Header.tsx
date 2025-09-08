import { motion } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
import KeyboardHint from './KeyboardHint';

interface HeaderProps {
  onNewChat: () => void;
  onToggleCommandPalette: () => void;
}

export default function Header({ onNewChat, onToggleCommandPalette }: HeaderProps) {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <AnimatedLogo />
          
          <div className="flex items-center gap-3">
            <KeyboardHint 
              keys={['⌘', 'K']}
              onClick={onToggleCommandPalette}
              label="Command"
            />
            
            <motion.button
              onClick={onNewChat}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
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