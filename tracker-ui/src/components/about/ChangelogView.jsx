import { useTranslation } from 'react-i18next';
import { APP_VERSION, VERSION_POLICY, changelogEntries } from '../../data/changelog';

const fallbackLanguage = 'es';

const getLocalized = (value, language) => {
  if (!value) return '';
  return value[language] || value[fallbackLanguage] || value.en || '';
};

export default function ChangelogView({ onViewChange }) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || fallbackLanguage;
  const policy = VERSION_POLICY.labels[language] || VERSION_POLICY.labels[fallbackLanguage];

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        padding: '6rem 2rem 8rem',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <main style={{ width: 'min(1120px, 100%)', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '2rem',
            alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <p
              style={{
                color: 'var(--tk-green)',
                margin: '0 0 0.45rem',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              {t('changelog.eyebrow')}
            </p>
            <h1
              style={{
                color: '#fff',
                margin: 0,
                fontSize: '2.8rem',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
              }}
            >
              {t('changelog.title')}
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '760px', lineHeight: 1.6, fontSize: '1rem' }}>
              {t('changelog.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onViewChange('home')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '900',
              letterSpacing: '1px',
              whiteSpace: 'nowrap'
            }}
          >
            {t('common.backToMenu')}
          </button>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <article
            style={{
              background: 'rgba(26,176,21,0.08)',
              border: '1px solid rgba(26,176,21,0.2)',
              borderRadius: '8px',
              padding: '1.25rem'
            }}
          >
            <p style={{ color: 'var(--tk-text-muted)', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>
              {t('changelog.currentVersion')}
            </p>
            <strong style={{ color: '#fff', fontSize: '2.1rem', letterSpacing: '1px' }}>v{APP_VERSION}</strong>
          </article>

          <article
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '1.25rem'
            }}
          >
            <p style={{ color: 'var(--tk-text-muted)', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>
              {t('changelog.totalUpdates')}
            </p>
            <strong style={{ color: '#fff', fontSize: '2.1rem', letterSpacing: '1px' }}>{changelogEntries.length}</strong>
          </article>

          <article
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '1.25rem'
            }}
          >
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.35rem', fontWeight: '900', textTransform: 'uppercase' }}>
              {policy.title}
            </p>
            <p style={{ color: 'var(--tk-text-muted)', margin: 0, lineHeight: 1.55 }}>{policy.body}</p>
          </article>
        </section>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {changelogEntries.map((entry, index) => (
            <article
              key={entry.version}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '1.25rem',
                background: index === 0 ? 'rgba(26,176,21,0.075)' : 'var(--tk-glass)',
                border: index === 0 ? '1px solid rgba(26,176,21,0.22)' : '1px solid var(--tk-glass-border)',
                borderRadius: '8px',
                padding: '1.35rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <aside>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    letterSpacing: '1px',
                    marginBottom: '0.35rem'
                  }}
                >
                  v{entry.version}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    color: 'var(--tk-green)',
                    background: 'rgba(26,176,21,0.08)',
                    border: '1px solid rgba(26,176,21,0.18)',
                    borderRadius: '999px',
                    padding: '0.25rem 0.55rem',
                    fontWeight: '900',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}
                >
                  {t(`changelog.types.${entry.type}`, { defaultValue: entry.type })}
                </span>
              </aside>

              <div>
                <p
                  style={{
                    color: 'var(--tk-green)',
                    margin: '0 0 0.3rem',
                    fontWeight: '900',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  {entry.codename}
                </p>
                <h2 style={{ color: '#fff', margin: '0 0 0.45rem', fontSize: '1.45rem', letterSpacing: '0.6px' }}>
                  {getLocalized(entry.title, language)}
                </h2>
                <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  {getLocalized(entry.summary, language)}
                </p>

                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  {entry.changes.map((change) => (
                    <div
                      key={`${entry.version}-${getLocalized(change.text, language)}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '92px 1fr',
                        gap: '0.75rem',
                        alignItems: 'start',
                        borderTop: '1px solid rgba(255,255,255,0.055)',
                        paddingTop: '0.55rem'
                      }}
                    >
                      <span
                        style={{
                          color: change.type === 'fixed' ? '#ffcf66' : 'var(--tk-green)',
                          fontSize: '0.72rem',
                          fontWeight: '900',
                          letterSpacing: '1px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {t(`changelog.types.${change.type}`, { defaultValue: change.type })}
                      </span>
                      <span style={{ color: '#d8d8d8', lineHeight: 1.45 }}>
                        {getLocalized(change.text, language)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
