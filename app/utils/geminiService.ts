/**
 * Gemini API Service
 * Handles communication with Google's Gemini API for transcription and translation
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { marked } from 'marked';

// Use the same model as in the demo
const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

// API Key from environment variable - used as fallback
const ENV_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB7B6681pEsgWq9mFkJNVqo3viGty2KiRw';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;
  
  constructor(uiApiKey?: string) {
    // Priority: 1. UI-provided API key, 2. Environment variable API key
    this.apiKey = uiApiKey || ENV_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }
  
  /**
   * Updates the API key and recreates the API client
   */
  updateApiKey(newApiKey: string) {
    // Only update if the new API key is different
    if (newApiKey && newApiKey !== this.apiKey) {
      this.apiKey = newApiKey;
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }
  
  /**
   * Transcribes audio using Gemini API
   */
  async getTranscription(base64Audio: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: MODEL_NAME,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const audioPrompt = {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio,
        },
      };

      const transcriptionPrompt = 'Please listen to this audio and provide a complete transcription of everything that was said.';
      
      const result = await model.generateContent([transcriptionPrompt, audioPrompt]);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
  
  /**
   * Detects language and translates text between English and Chinese
   * If the input is in English, translates to Chinese
   * If the input is in Chinese, translates to English
   */
  async translateText(text: string): Promise<{ 
    translation: string, 
    sourceLanguage: 'chinese' | 'english' | 'unknown',
    targetLanguage: 'chinese' | 'english' 
  }> {
    try {
      if (!text || text.trim() === '') {
        return { 
          translation: '', 
          sourceLanguage: 'unknown',
          targetLanguage: 'english'
        };
      }
      
      const model = this.genAI.getGenerativeModel({
        model: MODEL_NAME,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      // First detect the language
      const languageDetectionPrompt = `
        First, detect the language of this text: "${text}"
        Respond with just one word: "chinese" or "english". If you're not sure or it's another language, say "unknown".
      `;
      
      const languageResult = await model.generateContent(languageDetectionPrompt);
      const languageResponse = await languageResult.response;
      const detectedLanguage = languageResponse.text().toLowerCase().trim() as 'chinese' | 'english' | 'unknown';
      
      if (detectedLanguage === 'unknown') {
        return {
          translation: "Sorry, I can only translate between English and Chinese.",
          sourceLanguage: 'unknown',
          targetLanguage: 'english'
        };
      }
      
      // Determine target language
      const targetLanguage = detectedLanguage === 'english' ? 'chinese' : 'english';
      
      // Then translate
      const translationPrompt = `
        You are a professional translator between English and Chinese.
        The source text is in ${detectedLanguage}.
        Translate the following text into ${targetLanguage}. 
        Provide only the translation without any explanations or notes.

        Source text: "${text}"
      `;
      
      const translationResult = await model.generateContent(translationPrompt);
      const translationResponse = await translationResult.response;
      const translation = translationResponse.text();
      
      return {
        translation,
        sourceLanguage: detectedLanguage,
        targetLanguage
      };
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }
} 