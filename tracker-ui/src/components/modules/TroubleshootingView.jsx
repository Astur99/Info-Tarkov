import { useTranslation } from 'react-i18next';

export default function TroubleshootingView({ onViewChange }) {
  const { t } = useTranslation();
  const incidents = t('troubleshooting.incidents', { returnObjects: true });

  return (
    <div className="fade-in-slide terminal-panel" style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif" }}>
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>
            {t('troubleshooting.title')}
          </h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            {t('troubleshooting.subtitle')}
          </p>
        </div>
        <button
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.3s' }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
          }}
        >
          {t('common.backToMenu')}
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {incidents.map((incident) => (
          <div
            key={incident.code}
            style={{ backgroundColor: 'var(--tk-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--tk-glass-border)', borderRadius: '12px', padding: '2.5rem', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: '1.5rem', right: '2.5rem', color: 'var(--tk-red)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', border: '1px solid var(--tk-red)', padding: '3px 8px', borderRadius: '4px' }}>
              {incident.code}
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {incident.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <p>
                <strong style={{ color: '#fff', letterSpacing: '0.5px' }}>{t('troubleshooting.symptomLabel')}:</strong>{' '}
                <span style={{ color: 'var(--tk-text-muted)' }}>{incident.symptom}</span>
              </p>
              <p>
                <strong style={{ color: 'var(--tk-green)', letterSpacing: '0.5px' }}>{t('troubleshooting.fixLabel')}:</strong>{' '}
                <span style={{ color: '#eee' }}>{incident.fix}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
