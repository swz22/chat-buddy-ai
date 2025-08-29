import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950" />
      
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 100,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl" />
      </motion.div>
      
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 dark:from-pink-500/10 dark:to-orange-500/10 rounded-full blur-3xl" />
      </motion.div>
      
      <motion.div
        className="absolute top-1/3 left-1/3 w-64 h-64"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-green-400/10 to-blue-400/10 dark:from-green-500/5 dark:to-blue-500/5 rounded-full blur-2xl" />
      </motion.div>
      
      <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[1px]" />
    </div>
  );
}