import { useEffect, useState } from 'react';

const LIVE_EVENTS_JSON_URL =
  'https://raw.githubusercontent.com/tarkov-dev/tarkovdata/master/live-events.json';

const LIVE_EVENTS_JSDELIVR_URL =
  'https://cdn.jsdelivr.net/gh/tarkov-dev/tarkovdata@master/live-events.json';

const MANUAL_ACTIVE_EVENTS = [
  {
    id: 'manual-full-speed-ahead',
    title: 'Full Speed Ahead',
    type: 'event',
    date: new Date().toISOString(),
    link: 'https://escapefromtarkov.fandom.com/wiki/Events',
    source: 'MANUAL_OVERRIDE',
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

  const day = Number(match[1]);
  const month = months[match[2].toLowerCase()];
  const year = Number(match[3]);

  if (month === undefined) return null;

  return new Date(year, month, day);
}

function formatFechaAlerta(value) {
  const date = normalizeDate(value);
  if (!date) return 'FECHA_DESCONOCIDA';

  return date
    .toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-');
}

function daysFromToday(value) {
  const date = normalizeDate(value);
  if (!date) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function isFullSpeedAhead(title) {
  return cleanTitle(title).toLowerCase().includes('full speed ahead');
}

function isActiveEvent(evt) {
  if (evt.active) return true;
  if (isFullSpeedAhead(evt.title)) return true;

  return false;
}

function classifyEvent(evt) {
  if (isActiveEvent(evt)) {
    return {
      badgeLabel: 'EVENTO ACTIVO',
      badgeColor: '#ffcf66'
    };
  }

  return {
    badgeLabel: 'EVENTO FINALIZADO',
    badgeColor: 'rgba(255,255,255,0.25)'
  };
}

function normalizeEvent(raw, source = 'UNKNOWN') {
  if (!raw) return null;

  const title = cleanTitle(raw.title || raw.name || raw.eventName || raw.text);
  if (!title) return null;

  const date =
    raw.date ||
    raw.startDate ||
    raw.start ||
    raw.createdAt ||
    raw.publishedAt ||
    raw.updatedAt ||
    null;

  return {
    id:
      raw.id ||
      `${source}-${title}-${date || 'sin-fecha'}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    title,
    type: raw.type || raw.category || source,
    date,
    link: raw.link || raw.url || raw.wikiLink || raw.sourceUrl || null,
    source,
    active: Boolean(raw.active)
  };
}

function deduplicateEvents(events) {
  const seen = new Set();

  return events.filter((evt) => {
    const key = cleanTitle(evt.title).toLowerCase();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

async function fetchJsonFromUrl(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchJsonThroughAllOrigins(url) {
  const proxied = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxied);

  if (!response.ok) {
    throw new Error(`AllOrigins HTTP ${response.status}`);
  }

  const wrapper = await response.json();

  if (!wrapper?.contents) {
    throw new Error('Respuesta proxy vacía.');
  }

  return JSON.parse(wrapper.contents);
}

async function fetchLiveEventsJson() {
  const urls = [LIVE_EVENTS_JSON_URL, LIVE_EVENTS_JSDELIVR_URL];

  for (const url of urls) {
    try {
      const data = await fetchJsonFromUrl(url);

      if (Array.isArray(data)) {
        return data
          .map((evt) => normalizeEvent(evt, 'TARKOVDATA'))
          .filter(Boolean);
      }
    } catch (err) {
      console.warn('Fallo leyendo fuente directa:', url, err);
    }
  }

  try {
    const data = await fetchJsonThroughAllOrigins(LIVE_EVENTS_JSON_URL);

    if (Array.isArray(data)) {
      return data
        .map((evt) => normalizeEvent(evt, 'TARKOVDATA_PROXY'))
        .filter(Boolean);
    }
  } catch (err) {
    console.warn('Fallo leyendo fuente por proxy:', err);
  }

  return [];
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const activeA = isActiveEvent(a) ? 1 : 0;
    const activeB = isActiveEvent(b) ? 1 : 0;

    if (activeA !== activeB) return activeB - activeA;

    const da = normalizeDate(a.date)?.getTime() || 0;
    const db = normalizeDate(b.date)?.getTime() || 0;

    return db - da;
  });
}

export default function LiveEvents({ onViewChange }) {
  const [eventos, setEventos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiEvents = await fetchLiveEventsJson();

      const merged = sortEvents(
        deduplicateEvents([
          ...MANUAL_ACTIVE_EVENTS.map((evt) => normalizeEvent(evt, 'MANUAL_OVERRIDE')),
          ...apiEvents
        ].filter(Boolean))
      );

      const activos = merged.filter(isActiveEvent);
      const finalizados = merged.filter((evt) => !isActiveEvent(evt));

      setEventos(activos);
      setHistorico(finalizados);
      setLastUpdate(new Date());

      if (apiEvents.length === 0) {
        setError(
          'Las fuentes automáticas no devolvieron eventos. Mostrando override activo verificado manualmente.'
        );
      }
    } catch (err) {
      console.error('Error en la interceptación táctica:', err);

      const fallback = MANUAL_ACTIVE_EVENTS.map((evt) =>
        normalizeEvent(evt, 'MANUAL_OVERRIDE')
      ).filter(Boolean);

      setEventos(fallback);
      setHistorico([]);
      setLastUpdate(new Date());
      setError(
        'Error de red en las fuentes automáticas. Mostrando override activo verificado manualmente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const eventosVisibles = mostrarHistorico ? [...eventos, ...historico] : eventos;

  return (
    <div
      className="fade-in-slide"
      style={{
        padding: '6rem 2rem 8rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif",
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2.5rem',
          right: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '0.6rem 1.5rem',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.03)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--tk-text-muted)', letterSpacing: '1.5px' }}>
            HORA LOCAL
          </span>

          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '1px' }}>
            {currentTime.toLocaleTimeString('es-ES')}{' '}
            <span style={{ fontSize: '0.75rem', color: 'var(--tk-text-muted)' }}>
              {currentTime.toLocaleDateString('es-ES').replace(/\//g, '-')}
            </span>
          </span>
        </div>

        <div style={{ width: '1px', height: '26px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--tk-text-muted)', letterSpacing: '1.5px' }}>
            FEED // EVENTOS ACTIVOS
          </span>

          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--tk-green)', letterSpacing: '1px', marginTop: '1px' }}>
            {eventos.length} ACTIVOS
          </span>
        </div>
      </div>

      <header
        style={{
          marginBottom: '4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '1.5rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '1.5px', fontWeight: '700', color: '#fff' }}>
            EVENTOS EN VIVO
          </h2>

          <p style={{ color: 'var(--tk-text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
            Feed limitado a eventos actualmente activos.
          </p>

          {lastUpdate && (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '0.35rem', letterSpacing: '1px' }}>
              ÚLTIMA SINCRONIZACIÓN: {lastUpdate.toLocaleString('es-ES')}
            </p>
          )}
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
            letterSpacing: '1px',
            zIndex: 10
          }}
        >
          VOLVER AL MENÚ
        </button>
      </header>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(255,207,102,0.06)',
            border: '1px solid rgba(255,207,102,0.35)',
            color: '#ffcf66',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '2rem',
            fontWeight: '600'
          }}
        >
          ⚠️ AVISO DE FUENTE: {error}
        </div>
      )}

      {!loading && historico.length > 0 && (
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '1rem'
          }}
        >
          <span style={{ color: 'var(--tk-text-muted)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
            Hay {historico.length} eventos finalizados ocultos.
          </span>

          <button
            onClick={() => setMostrarHistorico((prev) => !prev)}
            style={{
              backgroundColor: mostrarHistorico ? 'rgba(255,255,255,0.05)' : 'var(--tk-green)',
              border: 'none',
              borderRadius: '6px',
              color: mostrarHistorico ? '#fff' : '#000',
              fontWeight: '800',
              letterSpacing: '1px',
              cursor: 'pointer',
              padding: '0.65rem 1rem',
              fontFamily: "'Rajdhani', sans-serif"
            }}
          >
            {mostrarHistorico ? 'OCULTAR FINALIZADOS' : 'MOSTRAR FINALIZADOS'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '8rem', color: 'var(--tk-green)', fontSize: '1.2rem', letterSpacing: '2px' }}>
          SINCRONIZANDO EVENTOS EN VIVO EN ESCAPE FROM TARKOV...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {eventosVisibles.map((evt) => {
            const { badgeLabel, badgeColor } = classifyEvent(evt);
            const active = isActiveEvent(evt);
            const days = daysFromToday(evt.date);

            const freshnessLabel =
              active
                ? 'EN CURSO'
                : days === null
                ? 'SIN FECHA'
                : days === 0
                ? 'HOY'
                : `HACE ${days} DÍAS`;

            return (
              <div
                key={evt.id}
                style={{
                  backgroundColor: 'var(--tk-glass)',
                  backdropFilter: 'blur(25px)',
                  WebkitBackdropFilter: 'blur(25px)',
                  border: active
                    ? '1px solid rgba(255,207,102,0.35)'
                    : '1px solid var(--tk-glass-border)',
                  borderRadius: '8px',
                  padding: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '2rem',
                  boxShadow: active
                    ? '0 0 22px rgba(255,207,102,0.08)'
                    : '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: active ? '#000' : '#ddd',
                        backgroundColor: badgeColor,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '1px'
                      }}
                    >
                      {badgeLabel}
                    </span>

                    <span style={{ fontSize: '0.85rem', color: 'var(--tk-text-muted)', fontWeight: '600' }}>
                      REGISTRO: {formatFechaAlerta(evt.date)}
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: active ? '#ffcf66' : 'rgba(255,255,255,0.35)',
                        fontWeight: '800',
                        letterSpacing: '1px'
                      }}
                    >
                      {freshnessLabel}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#fff',
                      letterSpacing: '0.5px',
                      lineHeight: '1.4'
                    }}
                  >
                    {cleanTitle(evt.title).toUpperCase()}
                  </h3>
                </div>

                {evt.link && (
                  <a
                    href={evt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      letterSpacing: '1px',
                      flexShrink: 0
                    }}
                  >
                    MÁS DETALLES
                  </a>
                )}
              </div>
            );
          })}

          {eventosVisibles.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                color: 'var(--tk-text-muted)',
                border: '1px dashed rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}
            >
              No se registran eventos activos ahora mismo.
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <button
          onClick={loadEvents}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#222' : 'var(--tk-green)',
            border: 'none',
            borderRadius: '6px',
            color: loading ? '#aaa' : '#000',
            fontWeight: '800',
            letterSpacing: '1px',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontFamily: "'Rajdhani', sans-serif",
            boxShadow: loading ? 'none' : '0 0 20px rgba(26, 176, 21, 0.2)'
          }}
        >
          {loading ? 'RE-ESCANEANDO BANDAS...' : 'REFRESCAR LISTA DE EVENTOS'}
        </button>
      </div>
    </div>
  );
}