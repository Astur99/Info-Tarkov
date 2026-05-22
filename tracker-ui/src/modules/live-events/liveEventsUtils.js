import { EVENT_SOURCES, VERIFIED_MANUAL_EVENTS } from './liveEventsData';

export function cleanTitle(value) {
  return String(value || '')
    .replace(/^\s*\d+[).\s-]+/g, '')
    .replace(/^\s*[â€¢\-â€“â€”]+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeDate(value) {
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

export function formatDate(value, locale) {
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

export function daysBetween(from, to = new Date()) {
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

export function getVerifiedManualEvents() {
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

export function dedupeEvents(events) {
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

export async function loadEventFeed(signal) {
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

export function sortEvents(events) {
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
