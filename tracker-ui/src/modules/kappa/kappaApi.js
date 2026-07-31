import { collectorItemNames } from './kappaData';
import { normalizeCollectorName } from './kappaUtils';
import { loadJsonItemCatalog } from '../../services/tarkovDataApi';

const TARKOV_JSON_URL = 'https://json.tarkov.dev';
const SUPPORTED_TASK_LOCALES = new Set([
  'cs', 'de', 'en', 'es', 'fr', 'hu', 'id', 'it', 'ja', 'ko',
  'pl', 'pt', 'ro', 'ru', 'sk', 'th', 'tr', 'vn', 'zh'
]);

const traderNamesById = {
  '54cb50c76803fa8b248b4571': 'Prapor',
  '54cb57776803fa99248b456e': 'Therapist',
  '579dc571d53a0658a154fbec': 'Fence',
  '58330581ace78e27b8b10cee': 'Skier',
  '5935c25fb3acc3127c3d8cd9': 'Peacekeeper',
  '5a7c2eca46aef81a7ca2145d': 'Mechanic',
  '5ac3b934156ae10c4430e83c': 'Ragman',
  '5c0647fdd443bc2504c2d371': 'Jaeger',
  '638f541a29ffd1183d187f57': 'Lightkeeper',
  '68fe15910f29ba3fdbba9d54': 'Taran',
  '656f0f98d80a697f855d34b1': 'BTR Driver',
  '68fe15990f29ba3fdbba9d55': 'Radio Station',
  '6617beeaa9cfa777ca915b7c': 'Ref',
  '688246518448b05efd61d461': 'Mr Kerman',
  '688246958448b05efd61d462': 'Voevoda',
  '69e0d6cc77b63940375b9173': 'Survivor'
};

const mapNamesById = {
  '55f2d3fd4bdc2d5f408b4567': 'Factory',
  '56f40101d2720b2a4d8b45d6': 'Customs',
  '5704e3c2d2720bac5b8b4567': 'Woods',
  '5704e4dad2720bb55b8b4567': 'Lighthouse',
  '5704e554d2720bac5b8b456e': 'Shoreline',
  '5704e5fad2720bc05b8b4567': 'Reserve',
  '5714dbc024597771384a510d': 'Interchange',
  '5714dc692459777137212e12': 'Streets',
  '59fc81d786f774390775787e': 'Factory',
  '5b0fc42d86f7744a585f9105': 'Labs',
  '653e6760052c01c1c805532f': 'Ground Zero',
  '65b8d6f5cdde2479cb2a3125': 'Ground Zero',
  '65cc8f81a9aac3e77d0cfd3e': 'Terminal',
  '6733700029c367a3d40b02af': 'The Labyrinth',
  '68236e8153654e8c1200798a': 'Ground Zero',
  '69af492a4819ea4ba10a69c5': 'Icebreaker',
  '6a294a5b5eb5f9a1700417b7': 'Labs'
};

const taskDatasetCache = new Map();
const taskDatasetRequests = new Map();

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) throw new Error(`tarkov.dev JSON request failed (${response.status})`);
  return response.json();
};

const normalizeTaskLocale = (locale) => {
  const language = String(locale || 'en').toLowerCase().split('-')[0];
  return SUPPORTED_TASK_LOCALES.has(language) ? language : 'en';
};

const getTranslatedValue = (translations, key, fallback = '') =>
  translations?.[key] || fallback || key || '';

const normalizeJsonMap = (mapId) => {
  const name = mapNamesById[mapId];
  return name ? { name, normalizedName: name } : null;
};

const normalizeJsonTasks = (taskMap, translations) => {
  const rawTasks = Object.values(taskMap || {});
  const tasksById = new Map(rawTasks.map((task) => [task.id, task]));

  const normalizeTrader = (traderId) => ({
    name: traderNamesById[traderId] || traderId || 'Unknown'
  });

  const normalizeTaskReference = (taskId) => {
    const referencedTask = tasksById.get(taskId);
    if (!referencedTask) return { id: taskId, name: taskId, trader: { name: 'Unknown' } };

    return {
      id: referencedTask.id,
      name: getTranslatedValue(
        translations,
        referencedTask.name,
        referencedTask.normalizedName
      ),
      trader: normalizeTrader(referencedTask.trader)
    };
  };

  return rawTasks.map((task) => ({
    id: task.id,
    name: getTranslatedValue(translations, task.name, task.normalizedName),
    wikiLink: task.wikiLink,
    kappaRequired: Boolean(task.kappaRequired),
    trader: normalizeTrader(task.trader),
    map: normalizeJsonMap(task.map),
    objectives: (task.objectives || []).map((objective) => {
      const mapIds = new Set([
        ...(objective.maps || []),
        ...(objective.zones || []).map((zone) => zone.map)
      ]);

      return {
        id: objective.id,
        type: objective.type,
        description: getTranslatedValue(translations, objective.description, objective.description),
        maps: [...mapIds].map(normalizeJsonMap).filter(Boolean)
      };
    }),
    taskRequirements: (task.taskRequirements || []).map((requirement) => ({
      ...requirement,
      task: normalizeTaskReference(requirement.task)
    }))
  }));
};

const normalizeTaskGameMode = (gameMode) =>
  String(gameMode || '').toLowerCase() === 'pve' ? 'pve' : 'regular';

const fetchJsonTasks = async (locale, gameMode) => {
  const language = normalizeTaskLocale(locale);
  const mode = normalizeTaskGameMode(gameMode);
  const tasksUrl = `${TARKOV_JSON_URL}/${mode}/tasks`;
  const [taskPayload, translationPayload] = await Promise.all([
    fetchJson(tasksUrl),
    fetchJson(`${tasksUrl}_${language}`)
  ]);

  const tasks = normalizeJsonTasks(taskPayload.data?.tasks, translationPayload.data);
  if (!tasks.length) throw new Error('tarkov.dev JSON tasks response is empty');
  return tasks;
};

export const fetchCollectorItemAssets = async ({
  locale = 'en',
  gameMode = 'regular'
} = {}) => {
  const { items } = await loadJsonItemCatalog({ gameMode, locale });
  const wantedNames = new Set(collectorItemNames.map(normalizeCollectorName));
  const assets = {};

  items.forEach((item) => {
    const candidates = [item.name, item.shortName, item.normalizedName]
      .map(normalizeCollectorName);
    if (!candidates.some((name) => wantedNames.has(name))) return;
    candidates.forEach((name) => {
      if (name) assets[name] = item;
    });
  });

  if (!Object.keys(assets).length) {
    throw new Error('Collector JSON item response is empty');
  }
  return assets;
};

export const fetchKappaTaskDataset = async ({
  locale = 'en',
  gameMode = 'regular'
} = {}) => {
  const language = normalizeTaskLocale(locale);
  const mode = normalizeTaskGameMode(gameMode);
  const cacheKey = `${mode}:${language}`;
  if (taskDatasetCache.has(cacheKey)) return taskDatasetCache.get(cacheKey);
  if (taskDatasetRequests.has(cacheKey)) return taskDatasetRequests.get(cacheKey);

  const request = (async () => {
    return {
      tasks: await fetchJsonTasks(language, mode),
      source: 'json'
    };
  })();

  taskDatasetRequests.set(cacheKey, request);

  try {
    const dataset = await request;
    taskDatasetCache.set(cacheKey, dataset);
    return dataset;
  } finally {
    taskDatasetRequests.delete(cacheKey);
  }
};

export const fetchKappaTasks = async (options) =>
  (await fetchKappaTaskDataset(options)).tasks;
