export const languageOptions = [
  { code: 'es', labelKey: 'language.es', nativeName: 'Español', intlLocale: 'es-ES', contentLanguage: 'es' },
  { code: 'en', labelKey: 'language.en', nativeName: 'English', intlLocale: 'en-US', contentLanguage: 'en' },
  { code: 'de', labelKey: 'language.de', nativeName: 'Deutsch', intlLocale: 'de-DE', contentLanguage: 'en' },
  { code: 'fr', labelKey: 'language.fr', nativeName: 'Français', intlLocale: 'fr-FR', contentLanguage: 'en' },
  { code: 'it', labelKey: 'language.it', nativeName: 'Italiano', intlLocale: 'it-IT', contentLanguage: 'en' },
  { code: 'ru', labelKey: 'language.ru', nativeName: 'Русский', intlLocale: 'ru-RU', contentLanguage: 'en' }
];

export const supportedLanguages = languageOptions.map((language) => language.code);

export const getLanguageOption = (language) =>
  languageOptions.find((option) => option.code === String(language || '').slice(0, 2).toLowerCase()) ||
  languageOptions[0];

export const getIntlLocale = (language) => getLanguageOption(language).intlLocale;

export const getContentLanguage = (language) => getLanguageOption(language).contentLanguage;
