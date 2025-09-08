import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'new', label: 'New Chat', shortcut: 'Ctrl+N', icon: '➕' },
    { id: 'search', label: 'Search Conversations', shortcut: 'Ctrl+/', icon: '🔍' },
    { id: 'toggle-theme', label: 'Toggle Theme', shortcut: 'Ctrl+T', icon: '🌓' },
    { id: 'export', label: 'Export Conversation', shortcut: 'Ctrl+E', icon: '📤' },
    { id: 'settings', label: 'Settings', shortcut: 'Ctrl+,', icon: '⚙️' },
    { id: 'help', label: 'Help', shortcut: 'Ctrl+H', icon: '❓' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  return (
    <>
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed bottom-20 right-6 z-50"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs">
              <button
                onClick={handleDismissTooltip}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="Dismiss"
              >
                <span className="text-xs font-bold">✕</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg">⌘</span>
                <div>
                  <p className="font-semibold text-sm">Open Command Palette</p>
                  <p className="text-xs opacity-90">Access all commands quickly</p>
                </div>
              </div>
              <div className="absolute bottom-0 right-8 w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 transform rotate-45 translate-y-1.5"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onCommand(cmd.id);
                      onClose();
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cmd.icon}</span>
                      <span className="text-gray-900 dark:text-gray-100">{cmd.label}</span>
                    </div>
                    <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                      {cmd.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}