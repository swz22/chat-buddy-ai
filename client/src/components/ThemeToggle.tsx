import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleClick = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <motion.button
      onClick={handleClick}
      className="relative p-2 rounded-lg glass-button group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Theme: ${theme}`}
    >
      <div className="relative w-5 h-5">
        <motion.svg
          className="absolute inset-0 w-5 h-5 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{
            opacity: resolvedTheme === 'light' ? 1 : 0,
            rotate: resolvedTheme === 'light' ? 0 : 180,
            scale: resolvedTheme === 'light' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </motion.svg>
        
        <motion.svg
          className="absolute inset-0 w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{
            opacity: resolvedTheme === 'dark' ? 1 : 0,
            rotate: resolvedTheme === 'dark' ? 0 : -180,
            scale: resolvedTheme === 'dark' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </motion.svg>

        {theme === 'system' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
        )}
      </div>
      
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
        initial={{ y: -5 }}
        animate={{ y: 0 }}
      >
        {theme === 'light' && 'Light mode'}
        {theme === 'dark' && 'Dark mode'}
        {theme === 'system' && 'System theme'}
      </motion.div>
    </motion.button>
  );
}