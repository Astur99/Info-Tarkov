const JSON_API_URL = 'https://json.tarkov.dev';

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

const normalizeReport = (report, mapsById) => {
  const sourceMap = mapsById.get(report?.map);
  const map = MAPS[sourceMap?.normalizedName];
  const timestamp = Number(report?.timestamp);

  if (!map || !Number.isFinite(timestamp) || timestamp <= 0) return null;

  return {
    mapId: map.id,
    mapName: map.name,
    reportedAt: new Date(timestamp).toISOString(),
    reporter: 'tarkov.dev',
    verified: true
  };
};

const fetchJsonReports = async (mode) => {
  const apiMode = mode === 'pve' ? 'pve' : 'regular';
  const sourceUrl = `${JSON_API_URL}/${apiMode}/maps`;
  const response = await fetch(sourceUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'InfoTarkov/1.2.12 (+https://infotarkov.com)'
    }
  });

  if (!response.ok) {
    throw new Error(`tarkov.dev maps JSON unavailable (${response.status}).`);
  }

  const payload = await response.json();
  const mapsById = new Map(
    Object.values(payload?.data?.maps || {}).map((map) => [map.id, map])
  );
  const reports = (payload?.data?.goonReports || [])
    .map((report) => normalizeReport(report, mapsById))
    .filter(Boolean)
    .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  if (!reports.length) {
    throw new Error('tarkov.dev maps JSON contains no valid Goons reports.');
  }

  return {
    mode,
    status: 'live',
    activeMapId: reports[0].mapId,
    activeMapName: reports[0].mapName,
    lastDetected: reports[0].reportedAt,
    reports: reports.slice(0, 12),
    source: 'json',
    sourceUrl,
    fetchedAt: new Date().toISOString()
  };
};

export const handler = async (event) => {
  const mode = String(event.queryStringParameters?.mode || 'pvp').toLowerCase() === 'pve'
    ? 'pve'
    : 'pvp';
  const now = Date.now();
  const cached = cache.get(mode);

  if (cached && now - cached.createdAt < CACHE_TTL_MS) {
    return jsonResponse(200, cached.payload, 'public, max-age=60');
  }

  try {
    const payload = await fetchJsonReports(mode);
    cache.set(mode, { createdAt: now, payload });
    lastGood.set(mode, payload);
    return jsonResponse(200, payload, 'public, max-age=60');
  } catch (error) {
    const fallback = lastGood.get(mode) || cached?.payload;

    if (fallback) {
      return jsonResponse(200, {
        ...fallback,
        status: 'cached',
        warning: error?.message || 'Goons JSON source unavailable.',
        fetchedAt: new Date().toISOString()
      });
    }

    return jsonResponse(502, {
      mode,
      status: 'error',
      error: error?.message || 'Goons JSON extraction failed.'
    });
  }
};
