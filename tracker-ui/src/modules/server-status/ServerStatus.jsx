import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '../../i18n/languages';

const SERVICES = [
  'Website',
  'Forum',
  'Authentication',
  'Launcher',
  'Group lobby',
  'Trading',
  'Matchmaking',
  'Friends and msg',
  'Inventory operations'
];

const serviceKeyByName = {
  website: 'website',
  forum: 'forum',
  authentication: 'authentication',
  launcher: 'launcher',
  'group lobby': 'groupLobby',
  trading: 'trading',
  matchmaking: 'matchmaking',
  'friends and msg': 'friends',
  'inventory operations': 'inventory'
};

const getStatusMeta = (rawStatus, t) => {
  if (rawStatus.includes('outage') || rawStatus.includes('down') || rawStatus.includes('issue')) {
    return { label: t('serverStatus.status.down'), color: '#ff4d4d', level: 'bad' };
  }

  if (rawStatus.includes('maintenance') || rawStatus.includes('update')) {
    return { label: t('serverStatus.status.maintenance'), color: '#7ab7ff', level: 'warn' };
  }

  if (rawStatus.includes('degraded') || rawStatus.includes('slow')) {
    return { label: t('serverStatus.status.degraded'), color: '#ffcf66', level: 'warn' };
  }

  return { label: t('serverStatus.status.operational'), color: 'var(--tk-green)', level: 'good' };
};

export default function ServerStatus({ onViewChange }) {
  const { i18n, t } = useTranslation();
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `
          query GetServerStatus {
            vanguardStatus {
              name
              status
            }
          }
        `
      })
    })
      .then((res) => res.json())
      .then((result) => {
        const statuses = result?.data?.vanguardStatus;

        if (Array.isArray(statuses) && statuses.length > 0) {
          setApiData(statuses);
          setError(null);
        } else {
          setApiData([]);
        }

        setLoading(false);
      })
      .catch((statusError) => {
        console.error(t('serverStatus.consoleError'), statusError);
        setError(t('serverStatus.errors.network'));
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadStatus, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadStatus]);

  const parsedServices = useMemo(() => {
    return SERVICES.map((serviceName) => {
      const matched = apiData.find(
        (item) => item?.name?.toLowerCase() === serviceName.toLowerCase()
      );

      const rawStatus = matched ? matched.status.toLowerCase() : 'ok';
      const statusMeta = getStatusMeta(rawStatus, t);
      const serviceKey = serviceKeyByName[serviceName.toLowerCase()];

      return {
        name: t(`serverStatus.services.${serviceKey}`, {
          defaultValue: serviceName.toUpperCase()
        }),
        ...statusMeta
      };
    });
  }, [apiData, t]);

  const activeServers = useMemo(() => {
    return parsedServices.filter((service) => service.level === 'good').length;
  }, [parsedServices]);

  if (loading && apiData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '12rem', color: 'var(--tk-green)', fontSize: '1.2rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
        {t('serverStatus.loading')}
      </div>
    );
  }

  return (
    <div className="fade-in-slide terminal-panel" style={{ padding: '6rem 2rem 8rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Rajdhani', sans-serif", position: 'relative' }}>
      <TacticalHeaderTracker
        active={activeServers}
        total={SERVICES.length}
        language={i18n.resolvedLanguage}
      />

      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '70%' }}>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>
            {t('serverStatus.title')}
          </h2>
          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            {t('serverStatus.subtitle')}
          </p>
        </div>

        <button
          onClick={() => onViewChange('home')}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', zIndex: 10 }}
        >
          {t('common.backToMenu')}
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(255,77,77,0.05)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', fontWeight: '600', letterSpacing: '0.5px' }}>
          {t('serverStatus.warning', { error })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {parsedServices.map((service) => (
          <div
            key={service.name}
            style={{
              backgroundColor: 'var(--tk-glass)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: `1px solid ${service.level !== 'good' ? service.color : 'var(--tk-glass-border)'}`,
              borderRadius: '8px',
              padding: '1.75rem',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: service.level !== 'good' ? `0 0 15px ${service.color}05` : '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{service.name}</h3>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: service.color,
                  boxShadow: `0 0 12px ${service.color}`,
                  flexShrink: 0,
                  marginTop: '4px'
                }}
              />
            </div>

            <strong style={{ color: service.color, letterSpacing: '1.5px', fontSize: '1.1rem', fontWeight: '800' }}>
              {service.label}
            </strong>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button
          onClick={loadStatus}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#222' : 'var(--tk-green)',
            border: 'none',
            borderRadius: '6px',
            color: loading ? '#aaa' : '#000',
            fontWeight: '800',
            letterSpacing: '1px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Rajdhani', sans-serif",
            padding: '1rem 2rem',
            fontSize: '1rem',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: loading ? 'none' : '0 0 20px rgba(26, 176, 21, 0.2)'
          }}
          onMouseEnter={(event) => {
            if (!loading) event.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(event) => {
            if (!loading) event.currentTarget.style.opacity = '1';
          }}
        >
          {loading ? t('serverStatus.resyncing') : t('serverStatus.refresh')}
        </button>
      </div>
    </div>
  );
}

function TacticalHeaderTracker({ active, total, language }) {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const locale = getIntlLocale(language);
  const allOperational = active === total;

  return (
    <div style={{
      position: 'absolute',
      top: '2.5rem',
      right: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2.5rem',
      fontFamily: "'Rajdhani', sans-serif",
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      padding: '0.6rem 1.5rem',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.03)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--tk-text-muted)', letterSpacing: '1.5px' }}>
          {t('serverStatus.header.localTime')}
        </span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '1px' }}>
          {time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
          <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)', fontWeight: '500' }}>
            {time.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
          </span>
        </span>
      </div>

      <div style={{ width: '1px', height: '26px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--tk-text-muted)', letterSpacing: '1.5px' }}>
          {t('serverStatus.header.serviceStatus')}
        </span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: allOperational ? 'var(--tk-green)' : '#ffcf66', letterSpacing: '1px', marginTop: '1px' }}>
          {t('serverStatus.header.systems', { active, total })}
        </span>
      </div>
    </div>
  );
}
