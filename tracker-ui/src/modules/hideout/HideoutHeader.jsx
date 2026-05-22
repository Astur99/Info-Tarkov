import { useTranslation } from 'react-i18next';
import { MARKET_MODES } from './hideoutUtils';

export default function HideoutHeader({ errorFuente, syncStatus, modoMercado, setModoMercado, onViewChange }) {
  const { t } = useTranslation();

  return (
    <header
      style={{
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '2.2rem',
            letterSpacing: '1.5px',
            fontWeight: '700',
            color: '#fff'
          }}
        >
          {t('hideoutModule.title')}
        </h2>

        <p
          style={{
            color: 'var(--tk-text-muted)',
            fontSize: '1rem',
            marginTop: '0.3rem',
            maxWidth: '820px',
            lineHeight: 1.5
          }}
        >
          {t('hideoutModule.subtitle')}
        </p>
        {errorFuente && (
          <p style={{ color: '#ffcf66', marginTop: '0.5rem', fontWeight: '800', letterSpacing: '0.8px' }}>
            {errorFuente}
          </p>
        )}
        <p
          style={{
            color: syncStatus === 'cloud' ? 'var(--tk-green)' : '#ffcf66',
            marginTop: '0.45rem',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          {syncStatus === 'cloud' && t('hideoutModule.sync.cloud')}
          {syncStatus === 'syncing' && t('hideoutModule.sync.syncing')}
          {syncStatus === 'local' && t('hideoutModule.sync.local')}
          {syncStatus === 'local-error' && t('hideoutModule.sync.localError')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.32)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)'
          }}
        >
          {Object.keys(MARKET_MODES).map((mode) => {
            const active = modoMercado === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setModoMercado(mode)}
                style={{
                  minWidth: '86px',
                  border: active ? '1px solid rgba(187, 211, 169, 0.55)' : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: active ? 'rgba(187, 211, 169, 0.85)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#11180f' : '#d7d7d7',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  fontFamily: "'Rajdhani', sans-serif",
                  boxShadow: active ? '0 0 18px rgba(187, 211, 169, 0.18)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onViewChange('home')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 22px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '700',
            letterSpacing: '1px'
          }}
        >
          {t('common.backToMenu')}
        </button>
      </div>
    </header>
  );
}
