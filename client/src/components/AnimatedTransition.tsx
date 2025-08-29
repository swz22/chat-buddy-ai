import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTransitionProps {
  children: ReactNode;
  mode: 'cards' | 'chat';
}

export default function AnimatedTransition({ children, mode }: AnimatedTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={mode === 'chat' 
          ? { opacity: 0, scale: 0.95, y: 20 }
          : { opacity: 0, scale: 1.05 }
        }
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0 
        }}
        exit={mode === 'chat'
          ? { opacity: 0, scale: 1.05 }
          : { opacity: 0, scale: 0.95, y: 20 }
        }
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}