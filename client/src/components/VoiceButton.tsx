import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceButton({ onTranscript, disabled = false, className = '' }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
        setError(null);
        setTranscript('');
      };
      
      recognition.onresult = (event: any) => {
        console.log('Voice recognition result:', event);
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        console.log('Transcript:', transcriptText);
        setTranscript(transcriptText);
        onTranscript(transcriptText);
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        
        if (event.error === 'network') {
          setError('Network Error - Cannot connect to speech service');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied - Please allow microphone access');
        } else if (event.error === 'no-speech') {
          setError('No speech detected - Please try again');
        } else if (event.error === 'audio-capture') {
          setError('No microphone found - Please check your microphone');
        } else if (event.error === 'language-not-supported') {
          setError('Language not supported');
        } else {
          setError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      console.log('Stopping voice recognition');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      console.log('Starting voice recognition');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        if (error.message && error.message.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        } else {
          setError('Failed to start voice recognition');
        }
      }
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={toggleListening}
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

        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {transcript && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 
                     bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] max-w-[300px]
                     border border-gray-200 dark:border-gray-700 z-50"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transcript}
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-2 right-0 
                     bg-red-50 dark:bg-red-900/20 rounded-lg p-3 min-w-[250px]
                     border border-red-200 dark:border-red-800 z-50"
          >
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Voice Recognition Error
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
                {error.includes('Network') && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Chrome can't reach Google's speech servers. Try:
                    <br />• Using Microsoft Edge instead
                    <br />• Disabling VPN/firewall
                    <br />• Using a different network
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}