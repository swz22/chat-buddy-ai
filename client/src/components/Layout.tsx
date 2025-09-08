import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  onNewChat: () => void;
  onToggleCommandPalette: () => void;
  showHeader?: boolean;
}

export default function Layout({ 
  children, 
  onNewChat, 
  onToggleCommandPalette,
  showHeader = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {showHeader && (
        <Header 
          onNewChat={onNewChat}
          onToggleCommandPalette={onToggleCommandPalette}
        />
      )}
      
      <motion.main 
        className={`${showHeader ? 'pt-16' : ''} min-h-screen`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  );
}