const TARKOV_GRAPHQL_URL = 'https://api.tarkov.dev/graphql';
const TARKOV_JSON_URL = 'https://json.tarkov.dev';

const SUPPORTED_LOCALES = new Set([
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
  '656f0f98d80a697f855d34b1': 'BTR Driver',
  '6617beeaa9cfa777ca915b7c': 'Ref'
};

const itemCatalogRequests = new Map();
const hideoutRequests = new Map();
const jsonDataRequests = new Map();

export const normalizeTarkovGameMode = (gameMode) =>
  String(gameMode || '').toLowerCase() === 'pve' ? 'pve' : 'regular';

export const normalizeTarkovLocale = (locale) => {
  const language = String(locale || 'en').toLowerCase().split('-')[0];
  return SUPPORTED_LOCALES.has(language) ? language : 'en';
};

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const fetchJsonData = async (path) => {
  if (jsonDataRequests.has(path)) return jsonDataRequests.get(path);

  const request = (async () => {
    const response = await fetch(`${TARKOV_JSON_URL}/${path}`, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`tarkov.dev JSON request failed (${response.status})`);
    }

    const payload = await response.json();
    if (!payload?.data) throw new Error('tarkov.dev JSON response was empty');
    return payload.data;
  })();

  jsonDataRequests.set(path, request);
  try {
    return await request;
  } catch (error) {
    jsonDataRequests.delete(path);
    throw error;
  }
};

export const postTarkovGraphql = async (query, { signal } = {}) => {
  const response = await fetch(TARKOV_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query }),
    signal
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.errors?.[0] || `tarkov.dev GraphQL request failed (${response.status})`);
  }
  if (payload?.errors?.length) {
    const message = payload.errors[0]?.message || payload.errors[0];
    throw new Error(message || 'tarkov.dev GraphQL request failed');
  }
  if (!payload?.data) throw new Error('tarkov.dev GraphQL response was empty');
  return payload.data;
};

const translate = (translations, key, fallback = '') =>
  translations?.[key] || fallback || key || '';

const normalizeJsonItem = (item, translations) => ({
  id: item.id,
  name: translate(translations, item.name, item.normalizedName),
  shortName: translate(translations, item.shortName, item.normalizedName),
  normalizedName: item.normalizedName,
  types: item.types || [],
  properties: item.properties || null,
  iconLink: item.iconLink,
  imageLink: item.image512pxLink || item.gridImageLink || item.iconLink,
  wikiLink: item.wikiLink,
  width: item.width || 1,
  height: item.height || 1,
  basePrice: item.basePrice || 0,
  avg24hPrice: item.avg24hPrice || 0,
  lastLowPrice: item.lastLowPrice || 0,
  low24hPrice: item.low24hPrice || 0,
  high24hPrice: item.high24hPrice || 0,
  lastOfferCount: item.lastOfferCount || 0,
  updated: item.updated || null,
  historicalPrices: [],
  sellFor: (item.sellToTrader || []).map((offer) => ({
    price: offer.priceRUB || offer.price || 0,
    source: traderNamesById[offer.trader] || offer.trader
  }))
});

export const loadJsonPriceHistory = async ({ gameMode, itemId, signal }) => {
  const mode = normalizeTarkovGameMode(gameMode);
  const safeItemId = encodeURIComponent(String(itemId || '').trim());
  if (!safeItemId) throw new Error('Missing item id');

  const response = await fetch(`${TARKOV_JSON_URL}/${mode}/prices/${safeItemId}`, {
    headers: { Accept: 'application/json' },
    signal
  });

  if (!response.ok) {
    throw new Error(`tarkov.dev price history request failed (${response.status})`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.data)) {
    throw new Error('tarkov.dev price history response was empty');
  }

  return payload.data
    .filter((sample) => Number(sample?.timestamp) > 0 && Number(sample?.price) > 0)
    .map((sample) => ({
      price: Number(sample.price),
      priceMin: Number(sample.priceMin || 0),
      offerCount: Number(sample.offerCount || 0),
      timestamp: Number(sample.timestamp)
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const loadJsonItemCatalog = async ({ gameMode, locale = 'en' }) => {
  const mode = normalizeTarkovGameMode(gameMode);
  const language = normalizeTarkovLocale(locale);
  const cacheKey = `${mode}:${language}`;

  if (itemCatalogRequests.has(cacheKey)) return itemCatalogRequests.get(cacheKey);

  const request = (async () => {
    const [itemData, translations] = await Promise.all([
      fetchJsonData(`${mode}/items`),
      fetchJsonData(`${mode}/items_${language}`)
    ]);

    const items = Object.values(itemData.items || {}).map((item) =>
      normalizeJsonItem(item, translations)
    );
    const itemsById = new Map(items.map((item) => [item.id, item]));
    return { items, itemsById, source: 'json' };
  })();

  itemCatalogRequests.set(cacheKey, request);
  try {
    return await request;
  } catch (error) {
    itemCatalogRequests.delete(cacheKey);
    throw error;
  }
};

export const searchJsonItems = async ({ query, gameMode, locale }) => {
  const { items } = await loadJsonItemCatalog({ gameMode, locale });
  const normalizedQuery = normalizeSearchText(query);

  return items.filter((item) => {
    const searchable = normalizeSearchText(
      `${item.name} ${item.shortName} ${item.normalizedName}`
    );
    return searchable.includes(normalizedQuery);
  });
};

export const findJsonItemsByNames = async ({ names, gameMode, locale }) => {
  const { items } = await loadJsonItemCatalog({ gameMode, locale });
  const normalizedNames = names.map(normalizeSearchText);

  return items.filter((item) => {
    const itemName = normalizeSearchText(item.name);
    const normalizedName = normalizeSearchText(item.normalizedName);
    return normalizedNames.some((name) =>
      itemName === name ||
      normalizedName === name ||
      itemName.includes(name) ||
      normalizedName.includes(name)
    );
  });
};

const normalizeRequirementAttributes = (attributes) =>
  Object.entries(attributes || {}).map(([name, value]) => ({
    type: name,
    name,
    value
  }));

const normalizeJsonHideout = (stationData, translations, itemCatalog) => {
  const rawStations = Object.values(stationData || {});
  const stationRefs = new Map(
    rawStations.map((station) => [
      station.id,
      {
        id: station.id,
        name: translate(translations, station.name, station.normalizedName),
        normalizedName: station.normalizedName,
        imageLink: station.imageLink
      }
    ])
  );

  return rawStations.map((station) => ({
    ...stationRefs.get(station.id),
    levels: (station.levels || []).map((level) => ({
      id: level.id,
      level: level.level,
      constructionTime: level.constructionTime,
      description: translate(translations, level.description, ''),
      stationLevelRequirements: (level.stationLevelRequirements || []).map((requirement) => ({
        ...requirement,
        station: stationRefs.get(requirement.station) || {
          id: requirement.station,
          name: requirement.station
        }
      })),
      skillRequirements: (level.skillRequirements || []).map((requirement) => ({
        ...requirement,
        name: requirement.skill,
        skill: {
          id: requirement.skill,
          name: requirement.skill,
          imageLink: null
        }
      })),
      traderRequirements: (level.traderRequirements || []).map((requirement) => ({
        ...requirement,
        level: requirement.value || requirement.level,
        trader: {
          id: requirement.trader,
          name: traderNamesById[requirement.trader] || requirement.trader
        }
      })),
      itemRequirements: (level.itemRequirements || []).map((requirement) => ({
        ...requirement,
        quantity: requirement.count,
        attributes: normalizeRequirementAttributes(requirement.attributes),
        item: itemCatalog.get(requirement.item) || {
          id: requirement.item,
          name: requirement.item,
          shortName: requirement.item,
          basePrice: 0,
          avg24hPrice: 0,
          lastLowPrice: 0
        }
      }))
    }))
  }));
};

export const loadJsonHideoutStations = async ({ gameMode, locale = 'en' }) => {
  const mode = normalizeTarkovGameMode(gameMode);
  const language = normalizeTarkovLocale(locale);
  const cacheKey = `${mode}:${language}`;

  if (hideoutRequests.has(cacheKey)) return hideoutRequests.get(cacheKey);

  const request = (async () => {
    const [stationData, translations, { itemsById }] = await Promise.all([
      fetchJsonData(`${mode}/hideout`),
      fetchJsonData(`${mode}/hideout_${language}`),
      loadJsonItemCatalog({ gameMode: mode, locale: language })
    ]);

    return normalizeJsonHideout(stationData, translations, itemsById);
  })();

  hideoutRequests.set(cacheKey, request);
  try {
    return await request;
  } catch (error) {
    hideoutRequests.delete(cacheKey);
    throw error;
  }
};
