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
        initial={{ opacity: 0, x: mode === ViewMode.CARDS ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: mode === ViewMode.CARDS ? 50 : -50 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}