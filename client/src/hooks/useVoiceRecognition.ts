import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceService } from '../services/voice.service';

export interface UseVoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: SpeechRecognitionErrorEvent) => void;
  onEnd?: () => void;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: false
  });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceServiceRef = useRef<VoiceService>(VoiceService.getInstance());
  const optionsRef = useRef(options);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const recognition = voiceServiceRef.current.getRecognitionInstance();
    
    if (!recognition) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }
    
    setState(prev => ({ ...prev, isSupported: true }));
    recognitionRef.current = recognition;
    recognition.continuous = optionsRef.current.continuous ?? false;
    recognition.interimResults = optionsRef.current.interimResults ?? true;
    recognition.lang = optionsRef.current.language ?? 'en-US';
    recognition.maxAlternatives = optionsRef.current.maxAlternatives ?? 1;
    
    recognition.onstart = () => {
      console.log('Recognition started successfully');
      setState(prev => ({ ...prev, isListening: true, error: null }));
      retryCountRef.current = 0;
    };
    
    recognition.onspeechstart = () => {
      console.log('Speech detected');
    };
    
    recognition.onspeechend = () => {
      console.log('Speech ended');
    };
    
    recognition.onaudiostart = () => {
      console.log('Audio capture started');
    };
    
    recognition.onaudioend = () => {
      console.log('Audio capture ended');
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setState(prev => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript: ''
        }));
        
        if (optionsRef.current.onResult) {
          optionsRef.current.onResult(finalTranscript.trim(), true);
        }
      } else {
        setState(prev => ({
          ...prev,
          interimTranscript
        }));
        
        if (optionsRef.current.onResult && optionsRef.current.interimResults) {
          optionsRef.current.onResult(interimTranscript, false);
        }
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event.error);
      
      if (event.error === 'network') {
        console.log('Network error - attempting retry...');
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`Retry attempt ${retryCountRef.current} of ${maxRetries}`);
          
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Retry started');
              } catch (e) {
                console.error('Retry failed:', e);
                setState(prev => ({
                  ...prev,
                  error: 'Unable to connect to speech service',
                  isListening: false
                }));
              }
            }
          }, 1000);
        } else {
          setState(prev => ({
            ...prev,
            error: 'Speech service unavailable - please try again',
            isListening: false
          }));
          retryCountRef.current = 0;
        }
      } else if (event.error === 'no-speech') {
        console.log('No speech detected - stopping');
        setState(prev => ({
          ...prev,
          isListening: false
        }));
      } else if (event.error === 'aborted' || event.error === 'not-allowed') {
        setState(prev => ({
          ...prev,
          error: event.error === 'not-allowed' ? 'Microphone access denied' : null,
          isListening: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: `Speech error: ${event.error}`,
          isListening: false
        }));
      }
      
      if (optionsRef.current.onError && event.error !== 'no-speech') {
        optionsRef.current.onError(event);
      }
    };
    
    recognition.onend = () => {
      console.log('Recognition ended');
      setState(prev => ({
        ...prev,
        isListening: false
      }));
      
      if (optionsRef.current.onEnd) {
        optionsRef.current.onEnd();
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Error aborting recognition:', e);
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state.isListening) {
      console.log('Cannot start - recognition ref:', recognitionRef.current, 'isListening:', state.isListening);
      return;
    }
    
    console.log('Starting speech recognition...');
    
    setState(prev => ({
      ...prev,
      isListening: true,
      error: null,
      transcript: '',
      interimTranscript: ''
    }));
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
      }
      
      recognitionRef.current.start();
      console.log('Recognition.start() called with single utterance mode');
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      
      if (error.name === 'InvalidStateError') {
        console.log('InvalidStateError - stopping and restarting...');
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          console.error('Restart failed:', e);
          setState(prev => ({
            ...prev,
            error: 'Please refresh and try again',
            isListening: false
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: `Cannot start: ${error.message}`,
          isListening: false
        }));
      }
    }
  }, [state.isListening]);
  
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !state.isListening) return;
    
    recognitionRef.current.stop();
    setState(prev => ({
      ...prev,
      isListening: false
    }));
  }, [state.isListening]);
  
  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: ''
    }));
  }, []);
  
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);
  
  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  };
}