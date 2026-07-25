import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { supportedLanguages } from './languages';

const localeLoaders = {
  es: () => import('./locales/es.json'),
  en: () => import('./locales/en.json'),
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

export const initializeI18n = async () => {
  const initialLanguage = getInitialLanguage();
  const locale = await localeLoaders[initialLanguage]();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        [initialLanguage]: { translation: locale.default }
      },
      lng: initialLanguage,
      fallbackLng: false,
      interpolation: {
        escapeValue: false
      }
    });
};

export default i18n;
