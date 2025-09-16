import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceButton({ onTranscript, disabled = false, className = '' }: VoiceButtonProps) {
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition({
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        onTranscript(text);
        resetTranscript();
      }
    }
  });

  const handleClick = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className={`relative p-3 rounded-full transition-all ${className} ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        <motion.div
          animate={isListening ? { scale: [1, 1.2, 1] } : {}}
          transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          {isListening ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </motion.div>

        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="w-full h-full bg-red-500 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                     bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] max-w-[300px]
                     border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transcript || interimTranscript}
            </p>
            {interimTranscript && (
              <div className="flex gap-1 mt-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                     bg-red-50 dark:bg-red-900/20 rounded-lg p-2 min-w-[200px]
                     border border-red-200 dark:border-red-800"
          >
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}