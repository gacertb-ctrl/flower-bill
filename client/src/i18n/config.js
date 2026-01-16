import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../lang/en';
import ta from '../lang/ta';

const savedLang = localStorage.getItem('lang') || 'ta';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
