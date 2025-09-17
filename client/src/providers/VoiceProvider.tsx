import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
  autoSpeak: boolean;
}

interface VoiceContextType {
  settings: VoiceSettings;
  updateSettings: (settings: VoiceSettings) => void;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  isSupported: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

interface VoiceProviderProps {
  children: ReactNode;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: '',
  autoSpeak: false
};

export function VoiceProvider({ children }: VoiceProviderProps) {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('voice-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    setRate,
    setPitch,
    setVolume,
    setVoice
  } = useSpeechSynthesis({
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume,
    voiceURI: settings.voiceURI
  });

  useEffect(() => {
    localStorage.setItem('voice-settings', JSON.stringify(settings));
    setRate(settings.rate);
    setPitch(settings.pitch);
    setVolume(settings.volume);
    if (settings.voiceURI) {
      setVoice(settings.voiceURI);
    }
  }, [settings, setRate, setPitch, setVolume, setVoice]);

  const updateSettings = useCallback((newSettings: VoiceSettings) => {
    setSettings(newSettings);
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!isSupported) return;
    
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/`[^`]+`/g, 'code')
      .replace(/[*_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '');
    
    await speak(cleanText, {
      rate: settings.rate,
      pitch: settings.pitch,
      volume: settings.volume,
      voiceURI: settings.voiceURI
    });
  }, [isSupported, speak, settings]);

  const value: VoiceContextType = {
    settings,
    updateSettings,
    speakText,
    stopSpeaking: stop,
    isSpeaking,
    isPaused,
    pauseSpeaking: pause,
    resumeSpeaking: resume,
    isSupported
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}