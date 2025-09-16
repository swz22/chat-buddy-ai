export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
}

export class VoiceService {
  private static instance: VoiceService;
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  private constructor() {
    this.synthesis = window.speechSynthesis;
    
    if (typeof webkitSpeechRecognition !== 'undefined') {
      this.recognition = new webkitSpeechRecognition();
    } else if (typeof SpeechRecognition !== 'undefined') {
      this.recognition = new SpeechRecognition();
    }
    
    this.loadVoices();
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }
  
  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }
  
  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }
  
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
  
  getDefaultVoice(): SpeechSynthesisVoice | null {
    const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en'));
    return englishVoices.find(voice => voice.default) || englishVoices[0] || this.voices[0] || null;
  }
  
  speak(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const defaultVoice = this.getDefaultVoice();
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
      
      if (settings?.voiceURI) {
        const selectedVoice = this.voices.find(v => v.voiceURI === settings.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.rate = settings?.rate || 1;
      utterance.pitch = settings?.pitch || 1;
      utterance.volume = settings?.volume || 1;
      
      utterance.onend = () => {
        resolve();
      };
      
      utterance.onerror = () => {
        reject(new Error('Speech synthesis error'));
      };
      
      this.synthesis.speak(utterance);
    });
  }
  
  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }
  
  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }
  
  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }
  
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
  
  isPaused(): boolean {
    return this.synthesis.paused;
  }
  
  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }
  
  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }
  
  getRecognitionInstance(): SpeechRecognition | null {
    return this.recognition;
  }
}