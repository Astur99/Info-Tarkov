import { useTranslation } from 'react-i18next';

const socialLinks = [
  {
    name: 'Twitch',
    handle: 'AsturTV',
    url: 'https://www.twitch.tv/AsturTV',
    descriptionKey: 'astur.links.twitch'
  },
  {
    name: 'X',
    handle: '@juankar_hh',
    url: 'https://x.com/juankar_hh',
    descriptionKey: 'astur.links.x'
  },
  {
    name: 'Instagram',
    handle: '@juankar_hh',
    url: 'https://www.instagram.com/juankar_hh/',
    descriptionKey: 'astur.links.instagram'
  }
];

export default function AsturView({ onViewChange }) {
  const { t } = useTranslation();

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
      <main style={{ width: 'min(920px, 100%)', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => onViewChange('home')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--tk-green)',
            cursor: 'pointer',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '900',
            letterSpacing: '1px',
            marginBottom: '2rem'
          }}
        >
          {t('common.backToTerminal')}
        </button>

        <header
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <p
            style={{
              color: 'var(--tk-green)',
              margin: '0 0 0.4rem',
              fontWeight: '900',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            {t('astur.eyebrow')}
          </p>
          <h1
            style={{
              color: '#fff',
              margin: 0,
              fontSize: '3rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}
          >
            Astur
          </h1>
          <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.6, maxWidth: '720px' }}>
            {t('astur.subtitle')}
          </p>
        </header>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '1.2rem',
                color: 'inherit',
                textDecoration: 'none',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = 'rgba(26,176,21,0.35)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <span>
                <strong style={{ color: '#fff', display: 'block', fontSize: '1.35rem' }}>
                  {link.name}
                </strong>
                <span style={{ color: 'var(--tk-green)', display: 'block', fontWeight: '900', marginTop: '0.15rem' }}>
                  {link.handle}
                </span>
                <span style={{ color: 'var(--tk-text-muted)', display: 'block', marginTop: '0.45rem', lineHeight: 1.5 }}>
                  {t(link.descriptionKey)}
                </span>
              </span>

              <span
                style={{
                  color: 'var(--tk-text-muted)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '0.45rem 0.75rem',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {t('astur.open')}
              </span>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}
