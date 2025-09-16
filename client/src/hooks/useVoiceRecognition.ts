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
  
  useEffect(() => {
    const recognition = voiceServiceRef.current.getRecognitionInstance();
    
    if (!recognition) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }
    
    setState(prev => ({ ...prev, isSupported: true }));
    recognitionRef.current = recognition;
    
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.language ?? 'en-US';
    recognition.maxAlternatives = options.maxAlternatives ?? 1;
    
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
        
        if (options.onResult) {
          options.onResult(finalTranscript.trim(), true);
        }
      } else {
        setState(prev => ({
          ...prev,
          interimTranscript
        }));
        
        if (options.onResult && options.interimResults) {
          options.onResult(interimTranscript, false);
        }
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false
      }));
      
      if (options.onError) {
        options.onError(event);
      }
    };
    
    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false
      }));
      
      if (options.onEnd) {
        options.onEnd();
      }
    };
    
    return () => {
      if (recognitionRef.current && state.isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [options.continuous, options.interimResults, options.language, options.maxAlternatives]);
  
  const startListening = useCallback(() => {
    if (!recognitionRef.current || state.isListening) return;
    
    setState(prev => ({
      ...prev,
      isListening: true,
      error: null,
      transcript: '',
      interimTranscript: ''
    }));
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition',
        isListening: false
      }));
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