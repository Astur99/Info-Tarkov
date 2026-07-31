const STATUS_URL = 'https://json.tarkov.dev/status';

let lastGoodStatus = null;

const normalizeStatus = (status) => {
  const code = String(status?.statusCode || status?.status || '').toLowerCase();
  if (code === '0' || code === 'ok') return 'ok';
  if (code === '1') return 'degraded';
  if (code === '2') return 'down';
  return code || 'unknown';
};

export const normalizeStatusPayload = (payload) =>
  (payload?.data?.currentStatuses || []).map((status) => ({
    name: status.name,
    status: normalizeStatus(status)
  }));

const fetchJsonStatus = async (fetchImpl) => {
  const response = await fetchImpl(STATUS_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-cache'
  });
  if (!response.ok) throw new Error(`JSON status unavailable (${response.status})`);

  const statuses = normalizeStatusPayload(await response.json());
  if (!statuses.length) throw new Error('JSON status response was empty');
  return statuses;
};

export const clearServerStatusCache = () => {
  lastGoodStatus = null;
};

export const fetchServerStatus = async (fetchImpl = fetch) => {
  try {
    const statuses = await fetchJsonStatus(fetchImpl);
    lastGoodStatus = {
      statuses,
      fetchedAt: new Date().toISOString()
    };
    return { ...lastGoodStatus, source: 'json', stale: false };
  } catch (error) {
    if (lastGoodStatus) {
      return { ...lastGoodStatus, source: 'cache', stale: true, warning: error.message };
    }
    throw error;
  }
};
