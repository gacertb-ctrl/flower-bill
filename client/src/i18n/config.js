// client/src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../lang/en';
import ta from '../lang/ta';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      ta: {
        translation: ta
      }
    },
    lng: 'en',
    fallbackLng: 'ta',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
