import { buildHealthReport } from './lib/app-health.js';

const CACHE_TTL_MS = 60 * 1000;
let cachedReport = null;

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
  },
  body: JSON.stringify(body)
});

export const handler = async () => {
  if (cachedReport && Date.now() - cachedReport.createdAt < CACHE_TTL_MS) {
    return jsonResponse(200, { ...cachedReport.payload, source: 'cache' });
  }

  try {
    const payload = await buildHealthReport();
    cachedReport = { createdAt: Date.now(), payload };
    return jsonResponse(200, { ...payload, source: 'live' });
  } catch (error) {
    if (cachedReport) {
      return jsonResponse(200, {
        ...cachedReport.payload,
        source: 'stale-cache',
        warning: error?.message || 'Health refresh failed.'
      });
    }
    return jsonResponse(503, {
      overall: 'down',
      checkedAt: new Date().toISOString(),
      error: error?.message || 'Health monitor failed.'
    });
  }
};
