import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  isActive?: boolean;
}

export default function AnimatedLogo({ size = 'medium', isActive = false }: AnimatedLogoProps) {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };
  
  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-10 h-10'
  };
  
  return (
    <motion.div
      className={`${sizes[size]} relative`}
      animate={isActive ? {
        rotate: [0, 360],
      } : {}}
      transition={isActive ? {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      } : {}}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ${sizes[size]}`}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={isActive ? {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse" as const
        } : {}}
      >
        <svg 
          className={`${iconSizes[size]} text-white`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
          />
        </svg>
      </motion.div>
      
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 bg-blue-400 rounded-xl opacity-30"
            animate={{
              scale: [1, 1.5],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute inset-0 bg-purple-400 rounded-xl opacity-30"
            animate={{
              scale: [1, 1.8],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </>
      )}
    </motion.div>
  );
}