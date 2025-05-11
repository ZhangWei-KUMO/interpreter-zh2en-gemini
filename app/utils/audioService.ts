/**
 * Audio Recording Service
 * Manages browser audio recording and processing
 */

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private waveformDataArray: Uint8Array | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Some browsers load voices asynchronously
      if (this.speechSynthesis) {
        this.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  // Load available voices
  private loadVoices(): void {
    if (this.speechSynthesis) {
      this.voices = this.speechSynthesis.getVoices();
    }
  }

  // Starts recording audio from the user's microphone
  async startRecording(): Promise<{ stream: MediaStream, analyserNode: AnalyserNode, dataArray: Uint8Array }> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Setup audio context and analyser for visualizations
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyserNode = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.75;
      const bufferLength = this.analyserNode.frequencyBinCount;
      this.waveformDataArray = new Uint8Array(bufferLength);
      
      // Connect source to analyser
      source.connect(this.analyserNode);
      
      // Setup media recorder
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      // Listen for recorded data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start();
      
      return {
        stream: this.stream,
        analyserNode: this.analyserNode,
        dataArray: this.waveformDataArray
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  // Stops recording and returns the recorded audio as a Blob
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        console.warn('Attempted to stop recording, but no active recording found');
        // Create an empty audio blob to avoid breaking the app flow
        const emptyBlob = new Blob([], { type: 'audio/webm' });
        this.cleanup();
        resolve(emptyBlob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Cleanup resources
  cleanup(): void {
    // Stop all audio tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }

    this.analyserNode = null;
    this.waveformDataArray = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  // Convert Blob to base64 for API transmission
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to convert blob to base64'));
      reader.readAsDataURL(blob);
    });
  }

  // Speak text using the Web Speech API
  speakText(text: string, language: 'zh-CN' | 'en-US' = 'en-US'): void {
    if (!this.speechSynthesis) {
      console.error('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Ensure voices are loaded
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    
    // Get appropriate voice for the language
    const voice = this.voices.find(v => v.lang.startsWith(language.substring(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }

    // Speak
    this.speechSynthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
} 