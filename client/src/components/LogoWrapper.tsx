import { motion } from 'framer-motion';
import GlowBotLogo from './GlowBotLogo';

interface LogoWrapperProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LogoWrapper({ 
  showText = true, 
  size = 'medium',
  className = ''
}: LogoWrapperProps) {
  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-3xl'
  };

  const subtitleSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <GlowBotLogo size={size} animated={true} />
      </motion.div>
      
      {showText && (
        <div className="flex flex-col">
          <motion.h1 
            className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent`}
            whileHover={{ scale: 1.02 }}
          >
            Chat Buddy AI
          </motion.h1>
          <motion.p 
            className={`${subtitleSizes[size]} text-gray-600 dark:text-gray-400 -mt-1`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your Intelligent Assistant
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}