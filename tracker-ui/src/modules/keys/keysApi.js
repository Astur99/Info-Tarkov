import { loadJsonItemCatalog, loadJsonMaps } from '../../services/tarkovDataApi.js';

const MAP_LABELS = {
  factory: 'Factory',
  'night-factory': 'Factory',
  customs: 'Customs',
  woods: 'Woods',
  lighthouse: 'Lighthouse',
  shoreline: 'Shoreline',
  reserve: 'Reserve',
  interchange: 'Interchange',
  'streets-of-tarkov': 'Streets',
  'the-lab': 'Labs',
  'the-lab-dark': 'Labs',
  'ground-zero': 'Ground Zero',
  'ground-zero-21': 'Ground Zero',
  terminal: 'Terminal',
  'the-labyrinth': 'Labyrinth'
};

export const isKeyItem = (item) => item?.types?.includes('keys');

export const buildKeyMapIndex = (maps) => {
  const index = new Map();

  maps.forEach((map) => {
    const label = MAP_LABELS[map?.normalizedName];
    if (!label) return;

    const keyIds = [
      ...(map.locks || [])
        .filter((lock) => !(
          lock?.lockType === 'trunk' &&
          lock?.key === '5448ba0b4bdc2d02308b456c'
        ))
        .map((lock) => lock?.key),
      ...(map.accessKeys || [])
    ].filter(Boolean);

    keyIds.forEach((keyId) => {
      const current = index.get(keyId) || [];
      if (!current.includes(label)) index.set(keyId, [...current, label]);
    });
  });

  return index;
};

export const loadJsonKeys = async ({ gameMode, locale }) => {
  const [catalog, mapDataset] = await Promise.all([
    loadJsonItemCatalog({ gameMode, locale }),
    loadJsonMaps({ gameMode, locale })
  ]);
  const mapIndex = buildKeyMapIndex(mapDataset.maps);
  const keys = catalog.items
    .filter(isKeyItem)
    .map((item) => ({
      ...item,
      maps: mapIndex.get(item.id) || [],
      mapSource: mapIndex.has(item.id) ? 'official' : 'unconfirmed'
    }));

  return {
    keys,
    mappedKeyCount: keys.filter((item) => item.maps.length > 0).length,
    source: 'json'
  };
};
