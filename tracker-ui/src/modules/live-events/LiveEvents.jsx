import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FALLBACK_EVENTS } from './liveEventsData';
import { daysBetween, dedupeEvents, formatDate, getVerifiedManualEvents, loadEventFeed, sortEvents } from './liveEventsUtils';
function getBadge(event, t) {
  const badges = {
    active: { label: t('liveEvents.status.active'), color: '#ffcf66', text: '#050505' },
    recent: { label: t('liveEvents.status.recent'), color: 'rgba(143,159,127,0.9)', text: '#050505' },
    reference: { label: t('liveEvents.status.reference'), color: 'rgba(255,255,255,0.12)', text: '#ddd' },
    ended: { label: t('liveEvents.status.ended'), color: 'rgba(255,255,255,0.08)', text: '#aaa' }
  };

  return badges[event.status] || badges.ended;
}

const getLocale = (language) => (language === 'en' ? 'en-US' : language || 'es');

export default function LiveEvents({ onViewChange }) {
  const { i18n, t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [showEnded, setShowEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const locale = getLocale(i18n.resolvedLanguage);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const loadEvents = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await loadEventFeed(controller.signal);
      const manualEvents = getVerifiedManualEvents();
      const normalized = result.events.length
        ? sortEvents(dedupeEvents([...manualEvents, ...result.events]))
        : manualEvents.length
        ? sortEvents(manualEvents)
        : FALLBACK_EVENTS;

      setEvents(normalized);
      setSource(result.source || (manualEvents.length ? t('liveEvents.sources.verifiedManual') : t('liveEvents.sources.fallbackManual')));
      setLastUpdate(new Date());

      if (!result.events.length && manualEvents.length) {
        setError(t('liveEvents.errors.manualActive'));
      } else if (!result.events.length) {
        setError(t('liveEvents.errors.noFeed'));
      }
    } catch (loadError) {
      console.error(loadError);
      setEvents(FALLBACK_EVENTS);
      setSource(t('liveEvents.sources.fallbackManual'));
      setLastUpdate(new Date());
      setError(t('liveEvents.errors.unexpected'));
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!cancelled) await loadEvents();
    };

    const initialLoad = window.setTimeout(run, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(initialLoad);
    };
  }, [loadEvents]);

  const counts = useMemo(() => ({
    active: events.filter((event) => event.status === 'active').length,
    recent: events.filter((event) => event.status === 'recent').length,
    ended: events.filter((event) => event.status === 'ended').length
  }), [events]);

  const visibleEvents = showEnded ? events : events.filter((event) => event.status !== 'ended');

  return (
    <div className="fade-in-slide terminal-panel" style={{ minHeight: '100vh', padding: '6rem 2rem 8rem', fontFamily: "'Rajdhani', sans-serif" }}>
      <main style={{ width: 'min(1180px, 100%)', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--tk-green)', margin: '0 0 0.45rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {t('liveEvents.eyebrow')}
            </p>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '2.7rem', textTransform: 'uppercase' }}>
              {t('liveEvents.title')}
            </h1>
            <p style={{ color: 'var(--tk-text-muted)', maxWidth: '820px', lineHeight: 1.6 }}>
              {t('liveEvents.subtitle')}
            </p>
            {lastUpdate && (
              <p style={{ color: 'rgba(255,255,255,0.35)', margin: '0.45rem 0 0', fontSize: '0.82rem', letterSpacing: '1px' }}>
                {t('liveEvents.lastSync', {
                  date: lastUpdate.toLocaleString(locale),
                  source: source || t('liveEvents.sources.none')
                })}
              </p>
            )}
          </div>

          <button type="button" onClick={() => onViewChange('home')} style={topButtonStyle}>
            {t('common.backToMenu')}
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <StatusCard label={t('liveEvents.counters.active')} value={counts.active} tone="#ffcf66" />
          <StatusCard label={t('liveEvents.counters.recent')} value={counts.recent} tone="var(--tk-green)" />
          <StatusCard label={t('liveEvents.counters.ended')} value={counts.ended} tone="rgba(255,255,255,0.55)" />
          <StatusCard label={t('liveEvents.counters.localTime')} value={currentTime.toLocaleTimeString(locale)} tone="#fff" />
        </section>

        <section style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={loadEvents} disabled={loading} style={actionButtonStyle(loading)}>
              {loading ? t('liveEvents.actions.scanning') : t('liveEvents.actions.refresh')}
            </button>
            <button type="button" onClick={() => setShowEnded((current) => !current)} style={secondaryButtonStyle}>
              {showEnded ? t('liveEvents.actions.hideEnded') : t('liveEvents.actions.showEnded')}
            </button>
          </div>

          <span style={{ color: 'var(--tk-text-muted)', fontSize: '0.86rem', fontWeight: '800', letterSpacing: '0.8px' }}>
            {t('liveEvents.visibleRecords', { count: visibleEvents.length })}
          </span>
        </section>

        {error && (
          <div style={{ background: 'rgba(255,207,102,0.07)', border: '1px solid rgba(255,207,102,0.28)', color: '#ffcf66', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontWeight: '800' }}>
            {t('liveEvents.sourceWarning', { error })}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--tk-green)', letterSpacing: '2px', fontWeight: '900' }}>
            {t('liveEvents.loading')}
          </div>
        ) : (
          <section style={{ display: 'grid', gap: '1rem' }}>
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}

            {visibleEvents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--tk-text-muted)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                {t('liveEvents.empty')}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function EventCard({ event, locale }) {
  const { t } = useTranslation();
  const badge = getBadge(event, t);
  const days = daysBetween(event.endDate || event.startDate);
  const formattedStart = formatDate(event.startDate, locale);
  const formattedEnd = formatDate(event.endDate, locale);
  const dateLabel = formattedEnd
    ? `${formattedStart || t('liveEvents.noDate')} - ${formattedEnd}`
    : formattedStart || t('liveEvents.noDate');

  const freshness = event.status === 'active'
    ? t('liveEvents.freshness.inProgress')
    : days === null
    ? t('liveEvents.noDate')
    : days === 0
    ? t('liveEvents.freshness.today')
    : t('liveEvents.freshness.daysAgo', { count: Math.abs(days) });

  const title = event.titleKey ? t(event.titleKey) : event.title;
  const description = event.descriptionKey ? t(event.descriptionKey) : event.description;

  return (
    <article style={{ background: event.status === 'active' ? 'rgba(255,207,102,0.055)' : 'rgba(255,255,255,0.035)', border: `1px solid ${event.status === 'active' ? 'rgba(255,207,102,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '1.35rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem', alignItems: 'center', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.7rem' }}>
          <span style={{ color: badge.text, background: badge.color, borderRadius: '4px', padding: '0.22rem 0.55rem', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
            {badge.label}
          </span>
          <span style={{ color: 'var(--tk-text-muted)', fontSize: '0.83rem', fontWeight: '800' }}>{dateLabel}</span>
          <span style={{ color: event.status === 'active' ? '#ffcf66' : 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>{freshness}</span>
        </div>

        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', textTransform: 'uppercase' }}>{title}</h2>
        {description && (
          <p style={{ color: 'var(--tk-text-muted)', margin: '0.45rem 0 0', lineHeight: 1.5 }}>{description}</p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.32)', margin: '0.45rem 0 0', fontSize: '0.78rem', letterSpacing: '0.8px' }}>
          {t('liveEvents.sourceLabel', { source: event.source })}
        </p>
      </div>

      {event.link && (
        <a href={event.link} target="_blank" rel="noreferrer" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 0.95rem', textDecoration: 'none', fontWeight: '900', whiteSpace: 'nowrap' }}>
          {t('liveEvents.details')}
        </a>
      )}
    </article>
  );
}

function StatusCard({ label, value, tone }) {
  return (
    <article style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem' }}>
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '900', textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ color: tone, display: 'block', fontSize: '1.55rem', marginTop: '0.25rem' }}>{value}</strong>
    </article>
  );
}

const topButtonStyle = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.8rem 1.2rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '900',
  letterSpacing: '1px',
  whiteSpace: 'nowrap'
};

const secondaryButtonStyle = {
  backgroundColor: 'rgba(255,255,255,0.055)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900',
  letterSpacing: '0.8px'
};

const actionButtonStyle = (disabled) => ({
  ...secondaryButtonStyle,
  backgroundColor: disabled ? 'rgba(255,255,255,0.055)' : 'var(--tk-green)',
  color: disabled ? 'var(--tk-text-muted)' : '#061006',
  cursor: disabled ? 'not-allowed' : 'pointer'
});
