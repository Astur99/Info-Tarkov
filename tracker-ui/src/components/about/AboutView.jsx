import { useTranslation } from 'react-i18next';

const sectionTitleStyle = {
  color: '#fff',
  margin: '0 0 1rem',
  fontSize: '1.55rem',
  letterSpacing: '0.7px'
};

const paragraphStyle = {
  color: 'var(--tk-text-muted)',
  margin: '0 0 1rem',
  fontSize: '1.08rem',
  lineHeight: 1.8
};

function StorySection({ title, paragraphs }) {
  return (
    <section style={{ marginTop: '3.5rem' }}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} style={paragraphStyle}>{paragraph}</p>
      ))}
    </section>
  );
}

export default function AboutView({ onViewChange }) {
  const { t } = useTranslation();
  const origin = t('about.presentation.originParagraphs', { returnObjects: true, defaultValue: [] });
  const purpose = t('about.presentation.purposeParagraphs', { returnObjects: true, defaultValue: [] });
  const tools = t('about.presentation.toolsParagraphs', { returnObjects: true, defaultValue: [] });

  return (
    <div
      className="fade-in-slide terminal-panel"
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        padding: 'clamp(2rem, 7vw, 6rem) clamp(1.25rem, 4vw, 2rem) 8rem',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <main style={{ width: 'min(1080px, 100%)', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => onViewChange('home')}
          style={{
            background: 'transparent',
            color: 'var(--tk-text-muted)',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            fontWeight: '900',
            letterSpacing: '1.2px',
            fontFamily: "'Rajdhani', sans-serif"
          }}
        >
          ← {t('common.backToMenu')}
        </button>

        <header style={{ padding: 'clamp(3rem, 8vw, 6rem) 0 3rem' }}>
          <h1
            style={{
              color: '#fff',
              margin: 0,
              maxWidth: '1080px',
              fontSize: 'clamp(2.7rem, 6.2vw, 5.2rem)',
              lineHeight: 0.98,
              letterSpacing: '-1px',
              textTransform: 'uppercase'
            }}
          >
            {t('about.presentation.title')}
          </h1>
          <p
            style={{
              color: '#d8d8d8',
              maxWidth: '820px',
              margin: '1.75rem 0 0',
              fontSize: 'clamp(1.18rem, 2.4vw, 1.42rem)',
              lineHeight: 1.6
            }}
          >
            {t('about.presentation.lead')}
          </p>
        </header>

        <div style={{ width: 'min(820px, 100%)' }}>
          <div style={{ width: '72px', height: '2px', background: 'var(--tk-green)', opacity: 0.75 }} />

          <StorySection title={t('about.presentation.originTitle')} paragraphs={origin} />
          <StorySection title={t('about.presentation.purposeTitle')} paragraphs={purpose} />
          <StorySection title={t('about.presentation.toolsTitle')} paragraphs={tools} />

          <footer
            style={{
              marginTop: '4.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <p style={{ ...paragraphStyle, color: '#fff', fontSize: '1.22rem', fontWeight: '700' }}>
              {t('about.presentation.closing')}
            </p>
            <p style={{ color: 'var(--tk-green)', margin: '1.5rem 0 0', fontWeight: '900', letterSpacing: '1.5px' }}>
              {t('about.presentation.signature')}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
