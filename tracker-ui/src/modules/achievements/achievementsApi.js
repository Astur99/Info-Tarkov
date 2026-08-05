import { loadJsonDataset } from '../../services/tarkovDataApi.js';
import wikiCatalog from './wikiAchievements.generated.json' with { type: 'json' };

const normalizeSlug = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const translate = (translations, key, fallback = '') =>
  translations?.[key] || fallback || key || '';

const wikiRows = Array.isArray(wikiCatalog.achievements) ? wikiCatalog.achievements : [];
const metadataBySlug = new Map(
  wikiRows
    .filter((achievement) => !achievement.category.startsWith('arena'))
    .map((achievement) => [normalizeSlug(achievement.name), achievement])
);

const normalizeArenaAchievement = (achievement) => ({
  ...achievement,
  id: achievement.id,
  category: achievement.category,
  normalizedRarity: achievement.rarity || 'common',
  imageLink: `/images/achievements/arena/${achievement.slug}.webp`,
  playersCompletedPercent: null,
  source: 'wiki'
});

export const loadAchievementCatalog = async (locale = 'en') => {
  const dataset = await loadJsonDataset({ path: 'regular/tasks', locale });
  const achievements = Object.values(dataset.data?.achievements || {}).map((achievement) => {
    const metadata = metadataBySlug.get(normalizeSlug(achievement.normalizedName || achievement.name));
    return {
      ...achievement,
      name: translate(dataset.translations, achievement.name, achievement.normalizedName),
      description: translate(dataset.translations, achievement.description, ''),
      category: metadata?.category || (achievement.normalizedRarity === 'seasonal' ? 'seasonal' : 'normal'),
      event: metadata?.event || '',
      reward: metadata?.reward || '',
      source: 'tarkov-dev'
    };
  });

  return {
    normal: achievements.filter((achievement) => achievement.category === 'normal'),
    event: achievements.filter((achievement) => achievement.category === 'event'),
    seasonal: achievements.filter((achievement) => achievement.category === 'seasonal'),
    retired: achievements.filter((achievement) => achievement.category === 'retired'),
    arena: wikiRows
      .filter((achievement) => achievement.category === 'arena' || achievement.category === 'arena-event')
      .map(normalizeArenaAchievement),
    source: dataset.stale ? 'stale-cache' : 'json',
    fetchedAt: dataset.fetchedAt || null
  };
};

export { normalizeSlug as normalizeAchievementSlug };
