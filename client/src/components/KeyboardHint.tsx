import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function KeyboardHint() {
  const [showHint, setShowHint] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('keyboard-hint-dismissed');
    if (isDismissed) {
      setDismissed(true);
      setShowHint(false);
    } else {
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 10000); // Hide after 10 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowHint(false);
    setDismissed(true);
    localStorage.setItem('keyboard-hint-dismissed', 'true');
  };

  if (dismissed || !showHint) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 right-4 z-50"
    >
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded text-sm font-mono">⌘</kbd>
            <span className="text-sm">+</span>
            <kbd className="px-2 py-1 bg-white/20 rounded text-sm font-mono">K</kbd>
          </div>
          <div className="text-sm">
            <p className="font-medium">Open Command Palette</p>
            <p className="text-xs opacity-90">Access all commands quickly</p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Arrow pointing to keyboard icon */}
        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-600"></div>
      </div>
    </motion.div>
  );
}