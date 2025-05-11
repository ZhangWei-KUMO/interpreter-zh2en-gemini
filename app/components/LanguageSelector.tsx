"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../utils/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'zh');
  };

  return (
    <div className={`language-selector ${className}`}>
      <label htmlFor="language-select">{t('language')}</label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="language-select-input"
      >
        <option value="en">{t('english')}</option>
        <option value="zh">{t('chinese')}</option>
      </select>
    </div>
  );
} 