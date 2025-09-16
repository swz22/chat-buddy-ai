import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceService, VoiceSettings } from '../services/voice.service';

export interface UseSpeechSynthesisOptions {
  autoPlay?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
}

export interface SpeechSynthesisState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  error: string | null;
  queue: string[];
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [state, setState] = useState<SpeechSynthesisState>({
    isSpeaking: false,
    isPaused: false,
    isSupported: false,
    voices: [],
    selectedVoice: null,
    error: null,
    queue: []
  });
  
  const voiceServiceRef = useRef<VoiceService>(VoiceService.getInstance());
  const settingsRef = useRef<Partial<VoiceSettings>>({
    rate: options.rate ?? 1,
    pitch: options.pitch ?? 1,
    volume: options.volume ?? 1,
    voiceURI: options.voiceURI
  });
  
  const updateSpeakingState = useCallback(() => {
    const service = voiceServiceRef.current;
    setState(prev => ({
      ...prev,
      isSpeaking: service.isSpeaking(),
      isPaused: service.isPaused()
    }));
  }, []);
  
  useEffect(() => {
    const service = voiceServiceRef.current;
    const isSupported = service.isSynthesisSupported();
    
    setState(prev => ({
      ...prev,
      isSupported
    }));
    
    if (!isSupported) return;
    
    const loadVoices = () => {
      const voices = service.getVoices();
      const defaultVoice = service.getDefaultVoice();
      
      setState(prev => ({
        ...prev,
        voices,
        selectedVoice: defaultVoice
      }));
    };
    
    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    const interval = setInterval(updateSpeakingState, 100);
    
    return () => {
      clearInterval(interval);
      service.stop();
    };
  }, [updateSpeakingState]);
  
  useEffect(() => {
    settingsRef.current = {
      rate: options.rate ?? 1,
      pitch: options.pitch ?? 1,
      volume: options.volume ?? 1,
      voiceURI: options.voiceURI
    };
  }, [options.rate, options.pitch, options.volume, options.voiceURI]);
  
  const speak = useCallback(async (text: string, settings?: Partial<VoiceSettings>) => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Speech synthesis is not supported in this browser'
      }));
      return;
    }
    
    try {
      setState(prev => ({
        ...prev,
        error: null,
        isSpeaking: true,
        isPaused: false
      }));
      
      const mergedSettings = {
        ...settingsRef.current,
        ...settings
      };
      
      await voiceServiceRef.current.speak(text, mergedSettings);
      
      setState(prev => ({
        ...prev,
        isSpeaking: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Speech synthesis failed',
        isSpeaking: false
      }));
    }
  }, [state.isSupported]);
  
  const speakQueue = useCallback(async () => {
    if (state.queue.length === 0) return;
    
    const texts = [...state.queue];
    setState(prev => ({ ...prev, queue: [] }));
    
    for (const text of texts) {
      await speak(text);
    }
  }, [state.queue, speak]);
  
  const addToQueue = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, text]
    }));
    
    if (options.autoPlay && !state.isSpeaking) {
      speakQueue();
    }
  }, [options.autoPlay, state.isSpeaking, speakQueue]);
  
  const stop = useCallback(() => {
    voiceServiceRef.current.stop();
    setState(prev => ({
      ...prev,
      isSpeaking: false,
      isPaused: false,
      queue: []
    }));
  }, []);
  
  const pause = useCallback(() => {
    voiceServiceRef.current.pause();
    setState(prev => ({
      ...prev,
      isPaused: true
    }));
  }, []);
  
  const resume = useCallback(() => {
    voiceServiceRef.current.resume();
    setState(prev => ({
      ...prev,
      isPaused: false
    }));
  }, []);
  
  const setVoice = useCallback((voiceURI: string) => {
    const voice = state.voices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      setState(prev => ({
        ...prev,
        selectedVoice: voice
      }));
      settingsRef.current.voiceURI = voiceURI;
    }
  }, [state.voices]);
  
  const setRate = useCallback((rate: number) => {
    settingsRef.current.rate = Math.max(0.1, Math.min(10, rate));
  }, []);
  
  const setPitch = useCallback((pitch: number) => {
    settingsRef.current.pitch = Math.max(0, Math.min(2, pitch));
  }, []);
  
  const setVolume = useCallback((volume: number) => {
    settingsRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);
  
  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
    addToQueue,
    speakQueue,
    setVoice,
    setRate,
    setPitch,
    setVolume
  };
}