import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EVENT_SOURCES = [
  {
    id: 'raw',
    label: 'tarkovdata raw',
    url: 'https://raw.githubusercontent.com/tarkov-dev/tarkovdata/master/live-events.json'
  },
  {
    id: 'jsdelivr',
    label: 'tarkovdata CDN',
    url: 'https://cdn.jsdelivr.net/gh/tarkov-dev/tarkovdata@master/live-events.json'
  }
];

const FALLBACK_EVENTS = [
  {
    id: 'fallback-events-wiki',
    titleKey: 'liveEvents.fallback.title',
    descriptionKey: 'liveEvents.fallback.description',
    type: 'fallback',
    link: 'https://escapefromtarkov.fandom.com/wiki/Events',
    source: 'FALLBACK',
    status: 'reference'
  }
];

const VERIFIED_MANUAL_EVENTS = [
  {
    id: 'verified-full-speed-ahead-2026-05',
    title: 'Full Speed Ahead',
    descriptionKey: 'liveEvents.manual.fullSpeedAhead.description',
    type: 'event',
    startDate: '2026-05-15T00:00:00Z',
    endDate: '2026-05-21T23:59:59Z',
    link: 'https://www.tarkovhead.com/en/news/new-full-speed-ahead-event-with-quest-walkthroughs-11',
    source: 'VERIFIED_MANUAL',
    active: true
  }
];

function cleanTitle(value) {
  return String(value || '')
    .replace(/^\s*\d+[\).\-\s]+/g, '')
    .replace(/^\s*[•\-–—]+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(value) {
  if (!value) return null;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const match = String(value).match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!match) return null;

  const months = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11
  };

  const month = months[match[2].toLowerCase()];
  if (month === undefined) return null;

  return new Date(Number(match[3]), month, Number(match[1]));
}

function formatDate(value, locale) {
  const date = normalizeDate(value);
  if (!date) return null;

  return date
    .toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-');
}

function daysBetween(from, to = new Date()) {
  const date = normalizeDate(from);
  if (!date) return null;

  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();

  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
}

function normalizeArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === 'object') {
    return Object.values(payload).flatMap((value) => (Array.isArray(value) ? value : []));
  }

  return [];
}

function getEventStatus(event) {
  if (event.status === 'reference') return 'reference';
  if (event.active === true || event.status === 'active') return 'active';

  const now = new Date();
  const start = normalizeDate(event.startDate || event.date);
  const end = normalizeDate(event.endDate || event.end);

  if (start && end && start <= now && now <= end) return 'active';
  if (!end && start) {
    const days = daysBetween(start, now);
    if (days !== null && days >= 0 && days <= 14) return 'recent';
  }
  if (end) {
    const daysSinceEnd = daysBetween(end, now);
    if (daysSinceEnd !== null && daysSinceEnd >= 0 && daysSinceEnd <= 14) return 'recent';
  }

  return 'ended';
}

function getVerifiedManualEvents() {
  return VERIFIED_MANUAL_EVENTS
    .map((event) => ({
      ...event,
      status: getEventStatus(event)
    }))
    .filter((event) => event.status === 'active' || event.status === 'recent');
}

function normalizeEvent(raw, source) {
  const title = cleanTitle(raw?.title || raw?.name || raw?.eventName || raw?.text || raw?.headline);
  if (!title) return null;

  const startDate = raw.startDate || raw.start || raw.date || raw.createdAt || raw.publishedAt || null;
  const endDate = raw.endDate || raw.end || raw.expiresAt || raw.finishDate || null;
  const description = cleanTitle(raw.description || raw.summary || raw.body || raw.details || '');

  const event = {
    id:
      raw.id ||
      `${source}-${title}-${startDate || 'sin-fecha'}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    title,
    description,
    type: raw.type || raw.category || 'event',
    startDate,
    endDate,
    link: raw.link || raw.url || raw.wikiLink || raw.sourceUrl || null,
    source,
    active: Boolean(raw.active),
    status: raw.status || null
  };

  return {
    ...event,
    status: getEventStatus(event)
  };
}

function dedupeEvents(events) {
  const seen = new Set();

  return events.filter((event) => {
    const key = cleanTitle(event.title).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchThroughProxy(url, signal) {
  const proxied = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const wrapper = await fetchJson(proxied, signal);
  if (!wrapper?.contents) throw new Error('Proxy without contents');
  return JSON.parse(wrapper.contents);
}

async function loadEventFeed(signal) {
  const failures = [];

  for (const source of EVENT_SOURCES) {
    try {
      const payload = await fetchJson(source.url, signal);
      const events = normalizeArrayPayload(payload)
        .map((event) => normalizeEvent(event, source.label))
        .filter(Boolean);

      if (events.length) return { events, source: source.label, failures };
    } catch (error) {
      failures.push(`${source.label}: ${error.message}`);
    }
  }

  try {
    const payload = await fetchThroughProxy(EVENT_SOURCES[0].url, signal);
    const events = normalizeArrayPayload(payload)
      .map((event) => normalizeEvent(event, 'tarkovdata proxy'))
      .filter(Boolean);

    if (events.length) return { events, source: 'tarkovdata proxy', failures };
  } catch (error) {
    failures.push(`proxy: ${error.message}`);
  }

  return { events: [], source: null, failures };
}

function sortEvents(events) {
  const statusWeight = {
    active: 4,
    recent: 3,
    reference: 2,
    ended: 1
  };

  return [...events].sort((a, b) => {
    const weightDiff = (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
    if (weightDiff) return weightDiff;

    const dateA = normalizeDate(a.startDate || a.endDate)?.getTime() || 0;
    const dateB = normalizeDate(b.startDate || b.endDate)?.getTime() || 0;
    return dateB - dateA;
  });
}

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

  const loadEvents = async () => {
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
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!cancelled) await loadEvents();
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

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
