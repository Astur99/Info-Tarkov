import { useTranslation } from 'react-i18next';


export default function AboutView({ onViewChange }) {
  const { t } = useTranslation();
  const localizedSections = t('about.sections', { returnObjects: true, defaultValue: [] });
  const localizedModuleDetails = t('about.moduleDetails', { returnObjects: true, defaultValue: [] });
  const localizedTechGroups = t('about.techGroups', { returnObjects: true, defaultValue: [] });

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
              {t('about.eyebrow')}
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
              {t('about.title')}
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '760px', lineHeight: 1.6, fontSize: '1rem' }}>
              {t('about.subtitle')}
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
            ...{
              background: 'rgba(26,176,21,0.055)',
              border: '1px solid rgba(26,176,21,0.18)',
              borderRadius: '8px',
              padding: '1.35rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }
          }}
        >
          <div>
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.35rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {t('about.howToUse.eyebrow')}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.45rem', textTransform: 'uppercase' }}>
              {t('about.howToUse.title')}
            </h2>
            <p style={{ color: 'var(--tk-text-muted)', margin: '0.4rem 0 0', lineHeight: 1.55, maxWidth: '760px' }}>
              {t('about.howToUse.body')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onViewChange('how-to-use')}
            style={{
              backgroundColor: 'rgba(182,205,169,0.9)',
              color: '#0b0c0b',
              border: '1px solid rgba(182,205,169,0.55)',
              padding: '0.85rem 1.1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '900',
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
              fontFamily: "'Rajdhani', sans-serif"
            }}
          >
            {t('about.howToUse.action')}
          </button>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {localizedTechGroups.map((group) => (
            <article
              key={group.title}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '1.2rem'
              }}
            >
              <h2 style={{ color: '#fff', marginTop: 0, fontSize: '1.1rem' }}>{group.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {group.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      color: 'var(--tk-green)',
                      background: 'rgba(26,176,21,0.08)',
                      border: '1px solid rgba(26,176,21,0.18)',
                      borderRadius: '999px',
                      padding: '0.25rem 0.55rem',
                      fontWeight: '800',
                      fontSize: '0.78rem'
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p
              style={{
                color: 'var(--tk-green)',
                margin: '0 0 0.35rem',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              {t('about.modulesEyebrow')}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', textTransform: 'uppercase' }}>
              {t('about.modulesTitle')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem' }}>
            {localizedModuleDetails.map((module) => (
              <article
                key={module.name}
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '1.35rem',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <h3
                  style={{
                    color: '#fff',
                    margin: '0 0 0.6rem',
                    fontSize: '1.2rem',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase'
                  }}
                >
                  {module.name}
                </h3>
                <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.6, margin: '0 0 0.9rem' }}>
                  {module.purpose}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' }}>
                  {module.actions.map((action) => (
                    <span
                      key={action}
                      style={{
                        color: 'var(--tk-green)',
                        background: 'rgba(26,176,21,0.07)',
                        border: '1px solid rgba(26,176,21,0.16)',
                        borderRadius: '999px',
                        padding: '0.22rem 0.55rem',
                        fontWeight: '800',
                        fontSize: '0.76rem'
                      }}
                    >
                      {action}
                    </span>
                  ))}
                </div>
                <p style={{ color: '#d8d8d8', lineHeight: 1.55, margin: 0 }}>
                  <strong style={{ color: '#fff' }}>{t('about.statusLabel')}:</strong> {module.status}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {localizedSections.map((section) => (
            <article
              key={section.title}
              style={{
                background: 'var(--tk-glass)',
                border: '1px solid var(--tk-glass-border)',
                borderRadius: '8px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <h2
                style={{
                  color: '#fff',
                  margin: '0 0 0.65rem',
                  fontSize: '1.25rem',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}
              >
                {section.title}
              </h2>
              <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.65, margin: 0 }}>
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
