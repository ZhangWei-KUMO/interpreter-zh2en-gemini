"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioService } from '../utils/audioService';
import { GeminiService } from '../utils/geminiService';
import { setupPlaceholders, setupTabNavigation } from '../utils/helpers';
import SettingsModal from './SettingsModal';

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: 'chinese' | 'english' | 'unknown';
  targetLanguage: 'chinese' | 'english';
  timestamp: number;
}

export default function VoiceNotesApp() {
  // Services
  const audioService = useRef<AudioService>(new AudioService());
  const geminiService = useRef<GeminiService>(new GeminiService());
  
  // Translation hooks
  const { t } = useTranslation();
  
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(t('ready'));
  const [currentTranslation, setCurrentTranslation] = useState<Translation>({
    id: crypto.randomUUID(),
    originalText: '',
    translatedText: '',
    sourceLanguage: 'unknown',
    targetLanguage: 'english',
    timestamp: Date.now()
  });
  const [translationHistory, setTranslationHistory] = useState<Translation[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  
  // 设置相关状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Refs
  const originalTextRef = useRef<HTMLDivElement>(null);
  const translatedTextRef = useRef<HTMLDivElement>(null);
  const liveWaveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const liveWaveformCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const waveformDrawingIdRef = useRef<number | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const waveformDataArrayRef = useRef<Uint8Array | null>(null);
  
  // 加载保存的API Key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      geminiService.current.updateApiKey(savedApiKey);
    }
  }, []);
  
  // Handle input change in contentEditable divs
  const handleOriginalTextChange = () => {
    if (originalTextRef.current) {
      setCurrentTranslation(prev => ({
        ...prev,
        originalText: originalTextRef.current?.innerHTML || ''
      }));
    }
  };
  
  const handleTranslatedTextChange = () => {
    if (translatedTextRef.current) {
      setCurrentTranslation(prev => ({
        ...prev,
        translatedText: translatedTextRef.current?.innerHTML || ''
      }));
    }
  };

  // 处理保存API Key的逻辑
  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    
    // 保存到localStorage
    if (newApiKey) {
      localStorage.setItem('geminiApiKey', newApiKey);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
    
    // 更新geminiService中的API Key
    geminiService.current.updateApiKey(newApiKey);
  };
  
  // Set up canvas context on mount
  useEffect(() => {
    if (liveWaveformCanvasRef.current) {
      liveWaveformCtxRef.current = liveWaveformCanvasRef.current.getContext('2d');
    }
    
    // Initialize placeholders and tab navigation
    setupPlaceholders();
    setupTabNavigation();
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      const themeToggleIcon = document.querySelector('#themeToggleButton i');
      if (themeToggleIcon) {
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
      }
    }
    
    // Setup window resize handler
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Cleanup
      stopLiveDisplay();
      window.removeEventListener('resize', handleResize);
      
      // Stop any ongoing speech when component unmounts
      audioService.current.stopSpeaking();
    };
  }, []);

  // Update contentEditable divs when translation changes
  useEffect(() => {
    if (originalTextRef.current) {
      // Only update if content is different to avoid selection issues
      if (originalTextRef.current.innerHTML !== currentTranslation.originalText) {
        originalTextRef.current.innerHTML = currentTranslation.originalText;
      }
    }
    
    if (translatedTextRef.current) {
      // Only update if content is different to avoid selection issues
      if (translatedTextRef.current.innerHTML !== currentTranslation.translatedText) {
        translatedTextRef.current.innerHTML = currentTranslation.translatedText;
      }
    }
  }, [currentTranslation.originalText, currentTranslation.translatedText]);

  // Helper to update canvas dimensions when window resizes
  const handleResize = () => {
    if (
      isRecording &&
      liveWaveformCanvasRef.current &&
      liveWaveformCanvasRef.current.style.display === 'block'
    ) {
      requestAnimationFrame(setupCanvasDimensions);
    }
  };

  // Set up canvas dimensions for proper rendering
  const setupCanvasDimensions = () => {
    if (!liveWaveformCanvasRef.current || !liveWaveformCtxRef.current) return;

    const canvas = liveWaveformCanvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    liveWaveformCtxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Start live display when recording
  const startLiveDisplay = () => {
    if (!liveWaveformCanvasRef.current) return;
    
    liveWaveformCanvasRef.current.style.display = 'block';
    
    // Set up canvas
    setupCanvasDimensions();
    
    // Start drawing waveform
    requestAnimationFrame(drawLiveWaveform);
    
    // Prevent body scrolling when recording modal is active
    document.body.style.overflow = 'hidden';
  };

  // Stop live display when recording ends
  const stopLiveDisplay = () => {
    if (!liveWaveformCanvasRef.current) return;
    
    liveWaveformCanvasRef.current.style.display = 'none';
    
    // Stop waveform animation
    if (waveformDrawingIdRef.current) {
      cancelAnimationFrame(waveformDrawingIdRef.current);
      waveformDrawingIdRef.current = null;
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
  };

  // Draw waveform visualization during recording
  const drawLiveWaveform = () => {
    if (
      !analyserNodeRef.current ||
      !waveformDataArrayRef.current ||
      !liveWaveformCtxRef.current ||
      !liveWaveformCanvasRef.current ||
      !isRecording
    ) {
      if (waveformDrawingIdRef.current) {
        cancelAnimationFrame(waveformDrawingIdRef.current);
      }
      waveformDrawingIdRef.current = null;
      return;
    }

    waveformDrawingIdRef.current = requestAnimationFrame(drawLiveWaveform);
    analyserNodeRef.current.getByteFrequencyData(waveformDataArrayRef.current);

    const ctx = liveWaveformCtxRef.current;
    const canvas = liveWaveformCanvasRef.current;

    const logicalWidth = canvas.clientWidth;
    const logicalHeight = canvas.clientHeight;

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const numBars = Math.floor(bufferLength * 0.5);

    if (numBars === 0) return;

    const totalBarPlusSpacingWidth = logicalWidth / numBars;
    const barWidth = Math.max(1, Math.floor(totalBarPlusSpacingWidth * 0.6));
    const barSpacing = Math.max(0, Math.floor(totalBarPlusSpacingWidth * 0.4));

    // Create gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    const recordingColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-recording')
        .trim() || '#ff3b30';
        
    gradient.addColorStop(0, recordingColor);
    gradient.addColorStop(1, 'rgba(255, 59, 48, 0.5)');
    ctx.fillStyle = gradient;

    let x = 0;

    for (let i = 0; i < numBars; i++) {
      if (x >= logicalWidth) break;

      const dataIndex = Math.floor(i * (bufferLength / numBars));
      
      // Add slight randomization to make it more organic
      const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
      const barHeightNormalized = (waveformDataArrayRef.current[dataIndex] / 255.0) * randomFactor;
      
      // Apply smoothing by averaging with neighboring values
      let smoothedHeight = barHeightNormalized;
      if (i > 0 && i < numBars - 1) {
        const prevIndex = Math.floor((i-1) * (bufferLength / numBars));
        const nextIndex = Math.floor((i+1) * (bufferLength / numBars));
        const prevHeight = waveformDataArrayRef.current[prevIndex] / 255.0;
        const nextHeight = waveformDataArrayRef.current[nextIndex] / 255.0;
        smoothedHeight = (prevHeight * 0.2 + barHeightNormalized * 0.6 + nextHeight * 0.2);
      }
      
      const barHeight = Math.max(2, Math.floor(smoothedHeight * logicalHeight * 0.8));

      // Draw a bar with rounded top and bottom
      const yPos = (logicalHeight - barHeight) / 2; // Center vertically
      const radius = barWidth / 2;

      ctx.beginPath();
      if (barHeight > radius * 2) {
        // Left top corner
        ctx.moveTo(x, yPos + radius);
        ctx.arc(x + radius, yPos + radius, radius, Math.PI, Math.PI * 1.5, false);
        
        // Right top corner
        ctx.lineTo(x + barWidth - radius, yPos);
        ctx.arc(x + barWidth - radius, yPos + radius, radius, Math.PI * 1.5, 0, false);
        
        // Right bottom corner
        ctx.lineTo(x + barWidth, yPos + barHeight - radius);
        ctx.arc(x + barWidth - radius, yPos + barHeight - radius, radius, 0, Math.PI * 0.5, false);
        
        // Left bottom corner
        ctx.lineTo(x + radius, yPos + barHeight);
        ctx.arc(x + radius, yPos + barHeight - radius, radius, Math.PI * 0.5, Math.PI, false);
        
        ctx.closePath();
      } else {
        // Draw just the rounded part for very small bars
        ctx.arc(x + radius, yPos + barHeight / 2, barHeight / 2, 0, Math.PI * 2);
      }
      ctx.fill();

      x += barWidth + barSpacing;
    }
  };

  const handleRecordButtonPress = () => {
    setIsButtonPressed(true);
    // 直接开始录音，不再使用长按检测
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      setRecordingStatus(t('recording'));
      
      const { analyserNode, dataArray } = await audioService.current.startRecording();
      analyserNodeRef.current = analyserNode;
      waveformDataArrayRef.current = dataArray;
      
      setIsRecording(true);
      
      // Reset current translation for a new recording
      setCurrentTranslation({
        id: crypto.randomUUID(),
        originalText: '',
        translatedText: '',
        sourceLanguage: 'unknown',
        targetLanguage: 'english',
        timestamp: Date.now()
      });
      
      // No need to call startLiveDisplay() since we're not using the modal anymore
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingStatus(t('errorStartingRecording'));
      setIsButtonPressed(false);
    }
  };

  const stopRecording = async () => {
    try {
      setRecordingStatus(t('processing'));
      
      // Get recorded audio
      const audioBlob = await audioService.current.stopRecording();
      
      setIsRecording(false);
      
      // Process the audio
      processAudio(audioBlob);
    } catch (error) {
      console.error('Error stopping recording:', error);
      
      setIsRecording(false);
      setRecordingStatus(t('errorProcessingRecording'));
    }
  };

  const handleRecordButtonRelease = () => {
    setIsButtonPressed(false);
  };

  // Clean up timeout if component unmounts
  useEffect(() => {
    return () => {
      audioService.current.stopSpeaking();
    };
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Update status
      setRecordingStatus(t('processing'));
      
      // Convert audio to base64 for API
      const base64Audio = await audioService.current.blobToBase64(audioBlob);
      
      // Get transcription
      const transcription = await geminiService.current.getTranscription(base64Audio, 'audio/webm');
      
      // Update status and display transcription
      setRecordingStatus(t('translating'));
      setIsTranslating(true);
      
      // Set original text
      setCurrentTranslation(prev => ({
        ...prev,
        originalText: transcription
      }));
      
      // Translate the transcription
      const { translation, sourceLanguage, targetLanguage } = await geminiService.current.translateText(transcription);
      
      // Update current translation
      const updatedTranslation = {
        id: currentTranslation.id,
        originalText: transcription,
        translatedText: translation,
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now()
      };
      
      setCurrentTranslation(updatedTranslation);
      
      // Add to history
      setTranslationHistory(prev => [updatedTranslation, ...prev]);
      
      // Update status
      setRecordingStatus(t('ready'));
      setIsTranslating(false);

      // Automatically speak the translation
      speakTranslation(translation, targetLanguage);
    } catch (error) {
      console.error('Error processing audio:', error);
      setRecordingStatus(t('errorProcessingAudio'));
      setIsTranslating(false);
    }
  };

  // Function to speak the translation
  const speakTranslation = (text: string, language: 'chinese' | 'english' | 'unknown') => {
    if (!text) return;
    
    // Stop any ongoing speech first
    stopSpeaking();
    
    setIsSpeaking(true);
    const speechLang = language === 'chinese' ? 'zh-CN' : 'en-US';
    audioService.current.speakText(text, speechLang);
    
    // Create a listener to detect when speech has finished
    const checkSpeaking = setInterval(() => {
      if (typeof window !== 'undefined' && !window.speechSynthesis.speaking) {
        clearInterval(checkSpeaking);
        setIsSpeaking(false);
      }
    }, 100);
  };

  // Function to stop speaking
  const stopSpeaking = () => {
    audioService.current.stopSpeaking();
    setIsSpeaking(false);
  };

  const toggleTheme = () => {
    const themeToggleIcon = document.querySelector('#themeToggleButton i');
    
    if (document.body.classList.contains('light-mode')) {
      // Switch to dark mode
      document.body.classList.remove('light-mode');
      if (themeToggleIcon) {
        themeToggleIcon.classList.remove('fa-moon');
        themeToggleIcon.classList.add('fa-sun');
      }
      localStorage.setItem('theme', 'dark');
    } else {
      // Switch to light mode
      document.body.classList.add('light-mode');
      if (themeToggleIcon) {
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
      }
      localStorage.setItem('theme', 'light');
    }
  };

  const clearCurrentTranslation = () => {
    setCurrentTranslation({
      id: crypto.randomUUID(),
      originalText: '',
      translatedText: '',
      sourceLanguage: 'unknown',
      targetLanguage: 'english',
      timestamp: Date.now()
    });
  };

  // Update status messages with translations
  useEffect(() => {
    setRecordingStatus(isRecording ? t('recording') : t('ready'));
  }, [isRecording, t]);

  // Render the component
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <span className="logo-accent">{t('appTitle')}</span>
          <span className="version-tag">{t('versionTag')}</span>
        </h1>
        <div className="header-controls">
          <button
            className="icon-button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
          >
            <i className="fa-solid fa-gear"></i>
          </button>
          <button
            id="themeToggleButton"
            className="icon-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className="fa-solid fa-sun"></i>
          </button>
        </div>
      </header>

      <main className="app-content">
        <div className="panel-container">
          <div className="primary-panel">
            <div className="translation-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h2>{t('originalText')}</h2>
                  {currentTranslation.sourceLanguage !== 'unknown' && (
                    <span className="language-tag">
                      {currentTranslation.sourceLanguage === 'english' ? t('english') : t('chinese')}
                    </span>
                  )}
                </div>
              </div>
              <div
                ref={originalTextRef}
                className="panel-content editable-content"
                contentEditable="true"
                data-placeholder={t('originalPlaceholder')}
                onInput={handleOriginalTextChange}
                onBlur={handleOriginalTextChange}
              ></div>
            </div>

            <div className="translation-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <h2>{t('translatedText')}</h2>
                  {currentTranslation.targetLanguage && (
                    <span className="language-tag">
                      {currentTranslation.targetLanguage === 'english' ? t('english') : t('chinese')}
                    </span>
                  )}
                </div>
                <div className="panel-actions">
                  <button
                    className="icon-button speak-button"
                    onClick={() => isSpeaking ? 
                      stopSpeaking() : 
                      speakTranslation(
                        currentTranslation.translatedText, 
                        currentTranslation.targetLanguage
                      )
                    }
                    disabled={!currentTranslation.translatedText || isTranslating}
                    title={isSpeaking ? t('stopSpeaking') : t('speakTranslationText')}
                  >
                    <i className={`fa-solid ${isSpeaking ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                  </button>
                </div>
              </div>
              <div 
                ref={translatedTextRef}
                className="panel-content editable-content"
                contentEditable="true"
                data-placeholder={t('translatedPlaceholder')}
                onInput={handleTranslatedTextChange}
                onBlur={handleTranslatedTextChange}
              ></div>
            </div>

            <div className="recording-controls">
              <div className="recording-buttons">
                <button
                  className={`record-button ${isRecording ? 'recording' : ''} ${isButtonPressed ? 'pressed' : ''}`}
                  onClick={handleRecordButtonPress}
                  onMouseDown={() => setIsButtonPressed(true)}
                  onMouseUp={() => setIsButtonPressed(false)}
                  onMouseLeave={() => setIsButtonPressed(false)}
                  onTouchStart={(e) => { e.preventDefault(); setIsButtonPressed(true); }}
                  onTouchEnd={(e) => { e.preventDefault(); setIsButtonPressed(false); }}
                  onTouchCancel={(e) => { e.preventDefault(); setIsButtonPressed(false); }}
                  disabled={isTranslating}
                  style={{userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation"}}
                >
                  {isRecording ? (
                    <><i className="fa-solid fa-microphone-lines"></i> {t('recordingNow')}</>
                  ) : (
                    <><i className="fa-solid fa-microphone"></i> {t('clickToRecordText')}</>
                  )}
                </button>
                
                <button 
                  className="icon-button clear-button"
                  onClick={clearCurrentTranslation}
                  disabled={isRecording || isTranslating || (!currentTranslation.originalText && !currentTranslation.translatedText)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
              
              <div className="recording-status">
                {isTranslating ? (
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                    <span>{recordingStatus}</span>
                  </div>
                ) : (
                  <span>{recordingStatus}</span>
                )}
              </div>
            </div>
          </div>

          <div className="secondary-panel">
            <div className="panel-header">
              <h2>{t('history')}</h2>
            </div>
            
            <div className="translation-history">
              {translationHistory.length === 0 ? (
                <div className="empty-state">
                  <p>{t('noHistory')}</p>
                  <p>{t('recordVoicePrompt')}</p>
                </div>
              ) : (
                <ul className="history-list">
                  {translationHistory.map((item) => (
                    <li key={item.id} className="history-item">
                      <div className="history-item-header">
                        <div className="history-language-tags">
                          <span className="language-tag source">
                            {item.sourceLanguage === 'english' ? t('english') : t('chinese')}
                          </span>
                          <i className="fa-solid fa-arrow-right"></i>
                          <span className="language-tag target">
                            {item.targetLanguage === 'english' ? t('english') : t('chinese')}
                          </span>
                        </div>
                        <div className="history-controls">
                          <button
                            className="icon-button speak-button history-speak"
                            onClick={() => speakTranslation(item.translatedText, item.targetLanguage)}
                            title={t('speakTranslationText')}
                          >
                            <i className="fa-solid fa-volume-high"></i>
                          </button>
                          <div className="history-timestamp">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="history-content">
                        <div className="history-original">{item.originalText}</div>
                        <div className="history-translated">{item.translatedText}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
        {t('copyright')}
        </p>
      </footer>

      {/* 设置模态窗口 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveApiKey={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </div>
  );
} 