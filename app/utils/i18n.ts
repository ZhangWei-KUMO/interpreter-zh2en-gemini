"use client";

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../public/locales/en/common.json';
import zhCommon from '../../public/locales/zh/common.json';

// Initialize i18n
const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon
      },
      zh: {
        common: zhCommon
      }
    },
    lng: 'zh', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    defaultNS: 'common'
  });

export default i18n; 