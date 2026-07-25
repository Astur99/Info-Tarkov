const STATUS_URL = 'https://json.tarkov.dev/status';
const GRAPHQL_URL = 'https://api.tarkov.dev/graphql';

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
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`JSON status unavailable (${response.status})`);

  const statuses = normalizeStatusPayload(await response.json());
  if (!statuses.length) throw new Error('JSON status response was empty');
  return statuses;
};

const fetchGraphqlStatus = async (fetchImpl) => {
  const response = await fetchImpl(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: 'query GetServerStatus { vanguardStatus { name status } }'
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors?.length) {
    throw new Error(`GraphQL status unavailable (${response.status})`);
  }

  const statuses = payload?.data?.vanguardStatus || [];
  if (!statuses.length) throw new Error('GraphQL status response was empty');
  return statuses;
};

export const fetchServerStatus = async (fetchImpl = fetch) => {
  try {
    return { statuses: await fetchJsonStatus(fetchImpl), source: 'json' };
  } catch (jsonError) {
    try {
      return { statuses: await fetchGraphqlStatus(fetchImpl), source: 'graphql' };
    } catch (graphqlError) {
      throw new AggregateError(
        [jsonError, graphqlError],
        'No server-status data source is available',
        { cause: graphqlError }
      );
    }
  }
};
