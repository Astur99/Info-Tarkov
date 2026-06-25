import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es.json';
import en from './locales/en.json';
import { supportedLanguages } from './languages';

const resources = {
  es: { translation: es },
  en: { translation: en }
};

const localeLoaders = {
  de: () => import('./locales/de.json'),
  fr: () => import('./locales/fr.json'),
  it: () => import('./locales/it.json'),
  ru: () => import('./locales/ru.json')
};

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('info_tarkov_language');
  if (supportedLanguages.includes(savedLanguage)) return savedLanguage;

  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'es';
};

export const loadLanguageResources = async (language) => {
  const normalizedLanguage = language?.slice(0, 2).toLowerCase();
  if (!normalizedLanguage || i18n.hasResourceBundle(normalizedLanguage, 'translation')) return;

  const loader = localeLoaders[normalizedLanguage];
  if (!loader) return;

  const locale = await loader();
  i18n.addResourceBundle(normalizedLanguage, 'translation', locale.default, true, true);
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: (code) => (code === 'es' ? ['es', 'en'] : ['en', 'es']),
    interpolation: {
      escapeValue: false
    }
  });

loadLanguageResources(initialLanguage).then(() => {
  if (initialLanguage !== 'es' && initialLanguage !== 'en') {
    i18n.changeLanguage(initialLanguage);
  }
});

export default i18n;
