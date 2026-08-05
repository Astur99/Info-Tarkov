import { getTarkovJsonGameMode } from '../../lib/gameModePreferences.js';

const TARKOV_JSON_URL = 'https://json.tarkov.dev';

const MOB_ALIASES = {
  bigpipe: 'bossknight',
  birdeye: 'bossknight',
  knight: 'bossknight',
  reshalla: 'bossbully',
  reshala: 'bossbully',
  shturman: 'bosskojaniy',
  glukhar: 'bossgluhar',
  sanitar: 'bosssanitar',
  killa: 'bosskilla',
  tagilla: 'bosstagilla',
  kaban: 'bossboar',
  kollontay: 'bosskolontay',
  zryachiy: 'bosszryachiy',
  partisan: 'bosspartisan',
  wedge: 'bosswedge'
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const titleFromSlug = (value) =>
  String(value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const mergeBossSpawnData = (localBosses, payload) => {
  const maps = Object.values(payload?.data?.maps || {});
  const mobs = payload?.data?.mobs || {};

  return localBosses.map((boss) => {
    const alias = MOB_ALIASES[normalize(boss.id)] || normalize(boss.id);
    const mob = Object.values(mobs).find((candidate) =>
      [candidate?.id, candidate?.name, candidate?.normalizedName]
        .map(normalize)
        .includes(alias)
    );
    const mobId = mob?.id || alias;
    const rawSpawnDetails = maps.flatMap((map) =>
      (map?.bosses || [])
        .filter((spawn) =>
          normalize(spawn?.mob) === normalize(mobId) &&
          Number(spawn.spawnChance) > 0
        )
        .map((spawn) => ({
          name: titleFromSlug(map.normalizedName) || map.name,
          chance: Math.round(Number(spawn.spawnChance || 0) * 100)
        }))
    );
    const spawnByMap = new Map();
    rawSpawnDetails.forEach((spawn) => {
      const current = spawnByMap.get(spawn.name);
      if (!current || spawn.chance > current.chance) spawnByMap.set(spawn.name, spawn);
    });
    const spawnDetails = [...spawnByMap.values()].sort((a, b) => b.chance - a.chance);

    if (!spawnDetails.length) return boss;

    return {
      ...boss,
      mapa: spawnDetails.map((spawn) => spawn.name).join(', '),
      spawn: `${spawnDetails[0].chance}%`,
      spawnDetails
    };
  });
};

export const fetchBossSpawnData = async ({ gameMode = 'regular', fetchImpl = fetch } = {}) => {
  const mode = getTarkovJsonGameMode(gameMode);
  const response = await fetchImpl(`${TARKOV_JSON_URL}/${mode}/maps`, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Boss JSON data unavailable (${response.status})`);

  const payload = await response.json();
  if (!Object.keys(payload?.data?.maps || {}).length) {
    throw new Error('Boss JSON data was empty');
  }
  return payload;
};
