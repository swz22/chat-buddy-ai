import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceService } from '../services/voice.service';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: {
    rate: number;
    pitch: number;
    volume: number;
    voiceURI: string;
    autoSpeak: boolean;
  }) => void;
  currentSettings: {
    rate: number;
    pitch: number;
    volume: number;
    voiceURI: string;
    autoSpeak: boolean;
  };
}

export default function VoiceSettings({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState(currentSettings);
  const [previewText, setPreviewText] = useState('Hello! This is how I sound with these settings.');
  
  useEffect(() => {
    const voiceService = VoiceService.getInstance();
    const loadedVoices = voiceService.getVoices();
    setVoices(loadedVoices);
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = voiceService.getVoices();
        setVoices(updatedVoices);
      };
    }
  }, []);
  
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };
  
  const handlePreview = async () => {
    const voiceService = VoiceService.getInstance();
    await voiceService.speak(previewText, {
      rate: settings.rate,
      pitch: settings.pitch,
      volume: settings.volume,
      voiceURI: settings.voiceURI
    });
  };
  
  const handleReset = () => {
    const defaultSettings = {
      rate: 1,
      pitch: 1,
      volume: 1,
      voiceURI: '',
      autoSpeak: false
    };
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-20 max-w-2xl mx-auto bg-white dark:bg-gray-800 
                     rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Voice Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice
                </label>
                <select
                  value={settings.voiceURI}
                  onChange={(e) => handleSettingChange('voiceURI', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Default Voice</option>
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speaking Rate: {settings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.rate}
                  onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pitch: {settings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Lower</span>
                  <span>Normal</span>
                  <span>Higher</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Quiet</span>
                  <span>Normal</span>
                  <span>Loud</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-speak AI responses
                </label>
                <button
                  onClick={() => handleSettingChange('autoSpeak', !settings.autoSpeak)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                           ${settings.autoSpeak ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                             ${settings.autoSpeak ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview Text
                </label>
                <textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Preview Voice
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                           rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}