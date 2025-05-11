"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../utils/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApiKey: (apiKey: string) => void;
  currentApiKey?: string;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onSaveApiKey,
  currentApiKey = ''
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  // 当弹窗打开时，更新API key输入框的值
  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey);
    }
  }, [isOpen, currentApiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(apiKey);
    onClose();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'zh');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h3>{t('settings')}</h3>
          <button className="icon-button" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="settings-form-group">
            <label htmlFor="geminiApiKey">{t('geminiApiKey')}</label>
            <input
              type="text"
              id="geminiApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('enterYourGeminiApiKey')}
              className="settings-input"
            />
            <p className="settings-help-text">
              {t('getApiKeyFrom')} <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
            </p>
          </div>

          <div className="settings-form-group">
            <label htmlFor="language">{t('language')}</label>
            <select
              id="language"
              value={language}
              onChange={handleLanguageChange}
              className="settings-input"
            >
              <option value="en">{t('english')}</option>
              <option value="zh">{t('chinese')}</option>
            </select>
          </div>

          <div className="settings-form-actions">
            <button type="submit" className="settings-save-button">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 