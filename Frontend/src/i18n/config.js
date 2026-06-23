import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './en/translation.json';
import translationAR from './ar/translation.json';

const resources = {
  en: { translation: translationEN },
  ar: { translation: translationAR }
};

i18n
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false 
    }
  });

i18n.on('languageChanged', (lng) => {
  document.body.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.body.lang = lng;
});

export default i18n;