import { useTranslation } from 'react-i18next';
import { languageOptions } from '../../i18n/languages';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    localStorage.setItem('info_tarkov_language', language);
    i18n.changeLanguage(language);
  };

  return (
    <div
      className="language-switcher"
      aria-label={t('language.label')}
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '13.4rem',
        zIndex: 2000,
        display: 'flex',
        gap: '0.25rem',
        padding: '0.25rem',
        backgroundColor: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '8px',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)'
      }}
    >
      {languageOptions.map((language) => {
        const isActive = i18n.resolvedLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => changeLanguage(language.code)}
            style={{
              minWidth: '2.2rem',
              border: 'none',
              borderRadius: '6px',
              padding: '0.32rem 0.45rem',
              background: isActive ? 'rgba(26,176,21,0.18)' : 'transparent',
              color: isActive ? 'var(--tk-green)' : 'var(--tk-text-muted)',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.72rem',
              fontWeight: '900',
              letterSpacing: '1px',
              cursor: 'pointer'
            }}
          >
            {t(language.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
