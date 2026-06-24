import { useTranslation } from 'react-i18next';
import { languageOptions } from '../../i18n/languages';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    localStorage.setItem('info_tarkov_language', language);
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language?.slice(0, 2) || i18n.resolvedLanguage || 'es';

  return (
    <label
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
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {t('language.label')}
      </span>
      <select
        value={currentLanguage}
        onChange={(event) => changeLanguage(event.target.value)}
        style={{
          border: 'none',
          borderRadius: '6px',
          padding: '0.32rem 1.8rem 0.32rem 0.55rem',
          background: 'rgba(26,176,21,0.18)',
          color: 'var(--tk-green)',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '0.72rem',
          fontWeight: '900',
          letterSpacing: '1px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          outline: 'none'
        }}
      >
        {languageOptions.map((language) => (
          <option key={language.code} value={language.code}>
            {t(language.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
