import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const handleClick = () => {
    // Toggle between light and dark only
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="relative p-2 rounded-lg glass-button group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
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
      </div>
      
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
        initial={{ y: -5 }}
        animate={{ y: 0 }}
      >
        {resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </motion.div>
    </motion.button>
  );
}