import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { ViewMode } from '../types/appState';

interface AnimatedTransitionProps {
  mode: ViewMode;
  children: ReactNode;
}

export default function AnimatedTransition({ mode, children }: AnimatedTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-full"
        style={{ position: 'relative' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}