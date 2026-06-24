const TRACKER_URLS = {
  pvp: 'https://www.tarkov-goon-tracker.com/',
  pve: 'https://www.tarkov-goon-tracker.com/pve'
};

const MAPS = {
  customs: { id: 'customs', name: 'Customs' },
  woods: { id: 'woods', name: 'Woods' },
  shoreline: { id: 'shoreline', name: 'Shoreline' },
  lighthouse: { id: 'lighthouse', name: 'Lighthouse' }
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const cache = new Map();
const lastGood = new Map();

const jsonResponse = (statusCode, body, cacheControl = 'no-store, max-age=0') => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': cacheControl,
    'Netlify-CDN-Cache-Control': cacheControl
  },
  body: JSON.stringify(body)
});

const decodeHtml = (value) =>
  String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const toPlainText = (html) =>
  decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeMapId = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return MAPS[normalized]?.id || null;
};

const parseReportDate = (value) => {
  const parsed = new Date(`${value} UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const parseActiveMap = (text) => {
  const match = text.match(/The Goons were last seen on:\s*(Customs|Woods|Shoreline|Lighthouse)/i);
  const mapId = normalizeMapId(match?.[1]);
  if (!mapId) return null;
  return MAPS[mapId];
};

const parseRecentReports = (text) => {
  const reports = [];
  const reportPattern =
    /\b(Customs|Woods|Shoreline|Lighthouse)\s+([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)\s+z\s+(.+?)\s+(true|false)\b/gi;

  let match;
  while ((match = reportPattern.exec(text)) && reports.length < 12) {
    const mapId = normalizeMapId(match[1]);
    const reportedAt = parseReportDate(match[2]);
    if (!mapId || !reportedAt) continue;

    reports.push({
      mapId,
      mapName: MAPS[mapId].name,
      reportedAt,
      reporter: String(match[3] || '').trim(),
      verified: match[4] === 'true'
    });
  }

  return reports;
};

const buildPayload = (mode, html) => {
  const text = toPlainText(html);
  const activeMap = parseActiveMap(text);

  if (!activeMap) {
    throw new Error('Could not parse active Goons map from tracker HTML.');
  }

  const reports = parseRecentReports(text);
  const lastReport = reports.find((report) => report.mapId === activeMap.id) || reports[0] || null;

  return {
    mode,
    status: 'live',
    activeMapId: activeMap.id,
    activeMapName: activeMap.name,
    lastDetected: lastReport?.reportedAt || new Date().toISOString(),
    reports,
    sourceUrl: TRACKER_URLS[mode],
    fetchedAt: new Date().toISOString()
  };
};

const fetchTrackerHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'InfoTarkov/1.2.3 (+https://infotarkov.com)'
    }
  });

  if (!response.ok) {
    throw new Error(`Goon tracker source unavailable (${response.status}).`);
  }

  return response.text();
};

export const handler = async (event) => {
  const mode = String(event.queryStringParameters?.mode || 'pvp').toLowerCase() === 'pve' ? 'pve' : 'pvp';
  const now = Date.now();
  const cached = cache.get(mode);

  if (cached && now - cached.createdAt < CACHE_TTL_MS) {
    return jsonResponse(200, { ...cached.payload, status: cached.payload.status || 'live' }, 'public, max-age=60');
  }

  try {
    const html = await fetchTrackerHtml(TRACKER_URLS[mode]);
    const payload = buildPayload(mode, html);

    cache.set(mode, { createdAt: now, payload });
    lastGood.set(mode, payload);

    return jsonResponse(200, payload, 'public, max-age=60');
  } catch (error) {
    const fallback = lastGood.get(mode) || cached?.payload;

    if (fallback) {
      return jsonResponse(200, {
        ...fallback,
        status: 'cached',
        warning: error?.message || 'Goon tracker source unavailable.',
        fetchedAt: new Date().toISOString()
      });
    }

    return jsonResponse(502, {
      mode,
      status: 'error',
      error: error?.message || 'Goon tracker extraction failed.'
    });
  }
};
