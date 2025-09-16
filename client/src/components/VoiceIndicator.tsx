import { motion, AnimatePresence } from 'framer-motion';

interface VoiceIndicatorProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isPaused?: boolean;
  volume?: number;
}

export default function VoiceIndicator({ 
  isListening = false, 
  isSpeaking = false,
  isPaused = false,
  volume = 0 
}: VoiceIndicatorProps) {
  
  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isPaused) return 'Paused';
    if (isSpeaking) return 'Speaking...';
    return 'Ready';
  };
  
  const getStatusColor = () => {
    if (isListening) return 'bg-red-500';
    if (isSpeaking) return 'bg-blue-500';
    if (isPaused) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getAnimationBars = () => {
    const barCount = 5;
    const bars = [];
    
    for (let i = 0; i < barCount; i++) {
      const baseHeight = isListening || isSpeaking ? 16 : 8;
      const maxHeight = 32;
      const height = isPaused ? baseHeight : baseHeight + (volume * (maxHeight - baseHeight));
      
      bars.push(
        <motion.div
          key={i}
          className={`w-1 ${getStatusColor()} rounded-full`}
          animate={{
            height: isListening || isSpeaking ? [
              `${baseHeight}px`,
              `${maxHeight - i * 4}px`,
              `${baseHeight}px`
            ] : `${height}px`
          }}
          transition={{
            duration: 0.5 + i * 0.1,
            repeat: isListening || isSpeaking ? Infinity : 0,
            ease: 'easeInOut'
          }}
          style={{ minHeight: '8px' }}
        />
      );
    }
    
    return bars;
  };

  return (
    <AnimatePresence mode="wait">
      {(isListening || isSpeaking || isPaused) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl 
                        border border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 h-8">
                {getAnimationBars()}
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getStatusText()}
                </span>
              </div>
              
              {isSpeaking && !isPaused && (
                <button
                  onClick={() => window.speechSynthesis.pause()}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Pause speech"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </button>
              )}
              
              {isSpeaking && isPaused && (
                <button
                  onClick={() => window.speechSynthesis.resume()}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Resume speech"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              )}
              
              {(isSpeaking || isListening) && (
                <button
                  onClick={() => {
                    if (isSpeaking) window.speechSynthesis.cancel();
                  }}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Stop"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}