const JSON_API_URL = 'https://json.tarkov.dev';
const DEFAULT_TIMEOUT_MS = 12000;

const SOURCE_DEFINITIONS = [
  { id: 'items-pvp', label: 'Items PVP', path: 'regular/items', type: 'items', minimum: 2000 },
  { id: 'items-pve', label: 'Items PVE', path: 'pve/items', type: 'items', minimum: 2000 },
  { id: 'tasks-pvp', label: 'Missions PVP', path: 'regular/tasks', type: 'tasks', minimum: 300 },
  { id: 'tasks-pve', label: 'Missions PVE', path: 'pve/tasks', type: 'tasks', minimum: 300 },
  { id: 'hideout-pvp', label: 'Hideout PVP', path: 'regular/hideout', type: 'hideout', minimum: 20 },
  { id: 'hideout-pve', label: 'Hideout PVE', path: 'pve/hideout', type: 'hideout', minimum: 20 },
  { id: 'maps-pvp', label: 'Maps PVP', path: 'regular/maps', type: 'maps', minimum: 10 },
  { id: 'maps-pve', label: 'Maps PVE', path: 'pve/maps', type: 'maps', minimum: 10 },
  {
    id: 'official-news',
    label: 'Official News',
    url: 'https://infotarkov.com/api/tarkov-news',
    type: 'news',
    minimum: 1
  }
];

const MODULE_DEFINITIONS = [
  { id: 'flea', label: 'Flea Market', dependencies: ['items-pvp', 'items-pve'] },
  { id: 'keys', label: 'Key System', dependencies: ['items-pvp', 'items-pve', 'maps-pvp', 'maps-pve'] },
  { id: 'hideout', label: 'Hideout', dependencies: ['hideout-pvp', 'hideout-pve', 'items-pvp', 'items-pve'] },
  { id: 'missions', label: 'Missions / Kappa', dependencies: ['tasks-pvp', 'tasks-pve'] },
  { id: 'ballistics', label: 'Ballistics', dependencies: ['items-pvp', 'items-pve'] },
  { id: 'goons', label: 'Goons Tracker', dependencies: ['maps-pvp', 'maps-pve'] },
  { id: 'news', label: 'Official News', dependencies: ['official-news'] }
];

const objectCount = (value) => Object.keys(value || {}).length;

const newestItemTimestamp = (items) => {
  const timestamps = Object.values(items || {})
    .map((item) => Date.parse(item?.updated || ''))
    .filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;
};

const inspectPayload = (definition, payload) => {
  if (definition.type === 'news') {
    return {
      count: Array.isArray(payload?.posts) ? payload.posts.length : 0,
      updatedAt: payload?.fetchedAt || null,
      details: { source: payload?.source || 'unknown' }
    };
  }

  const data = payload?.data;
  if (!data) throw new Error('Response does not contain data.');

  if (definition.type === 'items') {
    const items = data.items || {};
    const values = Object.values(items);
    return {
      count: values.length,
      updatedAt: newestItemTimestamp(items),
      details: {
        keys: values.filter((item) => item?.types?.includes('keys')).length,
        ammunition: values.filter((item) => item?.types?.includes('ammo')).length,
        armor: values.filter((item) =>
          item?.types?.some((type) => ['armor', 'armorPlate', 'helmet'].includes(type))
        ).length
      }
    };
  }

  if (definition.type === 'tasks') {
    return {
      count: objectCount(data.tasks),
      details: {
        questItems: objectCount(data.questItems),
        achievements: objectCount(data.achievements)
      }
    };
  }

  if (definition.type === 'hideout') {
    const stations = data.hideout || data.stations || data;
    return { count: objectCount(stations), details: {} };
  }

  const maps = data.maps || {};
  return {
    count: objectCount(maps),
    details: { goonReports: Array.isArray(data.goonReports) ? data.goonReports.length : 0 }
  };
};

const fetchJson = async (definition, fetchImpl, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const url = definition.url || `${JSON_API_URL}/${definition.path}`;
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'InfoTarkov-Health/1.3 (+https://infotarkov.com)'
      },
      signal: controller.signal
    });
    const latencyMs = Date.now() - startedAt;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const metrics = inspectPayload(definition, await response.json());
    const valid = metrics.count >= definition.minimum;
    return {
      id: definition.id,
      label: definition.label,
      status: valid ? 'operational' : 'degraded',
      url,
      latencyMs,
      minimum: definition.minimum,
      ...metrics,
      warning: valid ? null : `Expected at least ${definition.minimum} records.`
    };
  } catch (error) {
    return {
      id: definition.id,
      label: definition.label,
      status: 'down',
      url: definition.url || `${JSON_API_URL}/${definition.path}`,
      latencyMs: Date.now() - startedAt,
      minimum: definition.minimum,
      count: 0,
      updatedAt: null,
      details: {},
      warning: error?.name === 'AbortError' ? 'Request timed out.' : error?.message || 'Request failed.'
    };
  } finally {
    clearTimeout(timeout);
  }
};

const deriveStatus = (dependencies) => {
  if (dependencies.some((dependency) => dependency?.status === 'down')) return 'down';
  if (dependencies.some((dependency) => dependency?.status === 'degraded')) return 'degraded';
  return 'operational';
};

export const buildHealthReport = async ({
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  checkedAt = new Date().toISOString()
} = {}) => {
  const sources = await Promise.all(
    SOURCE_DEFINITIONS.map((definition) => fetchJson(definition, fetchImpl, timeoutMs))
  );
  const sourceIndex = new Map(sources.map((source) => [source.id, source]));
  const modules = MODULE_DEFINITIONS.map((module) => {
    const dependencies = module.dependencies.map((id) => sourceIndex.get(id));
    return {
      id: module.id,
      label: module.label,
      status: deriveStatus(dependencies),
      dependencies: module.dependencies
    };
  });
  const overall = deriveStatus(sources);

  return {
    overall,
    checkedAt,
    summary: {
      operational: modules.filter((module) => module.status === 'operational').length,
      degraded: modules.filter((module) => module.status === 'degraded').length,
      down: modules.filter((module) => module.status === 'down').length
    },
    modules,
    sources
  };
};

export const HEALTH_CHECK_INTERVAL_MINUTES = 15;
