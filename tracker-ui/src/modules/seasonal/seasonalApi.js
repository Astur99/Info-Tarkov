import { loadJsonDataset } from '../../services/tarkovDataApi';
import { BATTLE_PASS_DOCUMENTS } from './seasonalData';

const translate = (translations, key, fallback = '') =>
  translations?.[key] || fallback || key || '';

export const loadSeasonalIntel = async (locale = 'en') => {
  const [itemsDataset, tasksDataset] = await Promise.all([
    loadJsonDataset({ path: 'pvp-season/items', locale }),
    loadJsonDataset({ path: 'pvp-season/tasks', locale })
  ]);

  const rawItems = itemsDataset.data?.items || {};
  const documents = BATTLE_PASS_DOCUMENTS.map((document) => {
    const item = rawItems[document.id];
    if (!item) return { ...document, available: false };

    return {
      ...document,
      available: true,
      name: translate(itemsDataset.translations, item.name, document.name),
      shortName: translate(itemsDataset.translations, item.shortName, document.name),
      description: translate(itemsDataset.translations, item.description, ''),
      imageLink: item.image512pxLink || item.gridImageLink || item.iconLink,
      updated: item.updated || null
    };
  });

  const achievements = Object.values(tasksDataset.data?.achievements || {})
    .filter((achievement) => achievement.normalizedRarity === 'seasonal')
    .map((achievement) => ({
      ...achievement,
      name: translate(tasksDataset.translations, achievement.name, achievement.normalizedName),
      description: translate(tasksDataset.translations, achievement.description, ''),
      imageLink: achievement.imageLink
        || `/images/achievements/seasonal/${achievement.normalizedName}.webp`
    }));

  return {
    documents,
    achievements,
    taskCount: Object.keys(tasksDataset.data?.tasks || {}).length,
    source: itemsDataset.stale || tasksDataset.stale ? 'stale-cache' : 'json',
    fetchedAt: itemsDataset.fetchedAt || tasksDataset.fetchedAt
  };
};
