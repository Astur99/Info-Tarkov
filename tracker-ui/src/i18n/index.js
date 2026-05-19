import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es.json';
import en from './locales/en.json';
import { supportedLanguages } from './languages';

const resources = {
  es: { translation: es },
  en: { translation: en }
};

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('info_tarkov_language');
  if (supportedLanguages.includes(savedLanguage)) return savedLanguage;

  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
