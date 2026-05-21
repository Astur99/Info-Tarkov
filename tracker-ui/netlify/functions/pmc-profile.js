const STATIC_PLAYER_BASES = {
  PVP: 'https://players.tarkov.dev/profile',
  PVE: 'https://players.tarkov.dev/pve'
};

const TARKOV_GRAPHQL_URL = 'https://api.tarkov.dev/graphql';
const TARKOV_STATIC_TASKS_URL = 'https://json.tarkov.dev/regular/tasks';
const TARKOV_STATIC_TASK_TRANSLATIONS_URL = 'https://json.tarkov.dev/regular/tasks_en';

const MEMBER_FLAGS = {
  Developer: 1,
  EOD: 2,
  ChatModerator: 32,
  Sherpa: 256,
  Emissary: 512,
  Unheard: 1024
};

const RARITY_LABELS = {
  common: 'Comun',
  rare: 'Raro',
  legendary: 'Legendario'
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTimestamp = (value) => {
  const parsed = toNumber(value);
  if (!parsed) return null;
  return parsed < 10000000000 ? parsed * 1000 : parsed;
};

const formatDuration = (seconds) => {
  const parsed = toNumber(seconds);
  if (!parsed) return null;
  const hours = Math.floor(parsed / 3600);
  const minutes = Math.floor((parsed % 3600) / 60);
  if (hours <= 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
    'Netlify-CDN-Cache-Control': 'no-store'
  },
  body: JSON.stringify(body)
});

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'InfoTarkov/0.14.8' }
  });

  if (!response.ok) {
    throw new Error(`Fuente externa no disponible (${response.status}).`);
  }

  return response.json();
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'InfoTarkov/0.14.8' }
  });

  if (!response.ok) {
    throw new Error(`Fuente externa no disponible (${response.status}).`);
  }

  return response.text();
};

const fetchGraphql = async (query, variables = {}) => {
  const response = await fetch(TARKOV_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'InfoTarkov/0.14.8'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`GraphQL tarkov.dev no disponible (${response.status}).`);
  }

  const payload = await response.json();
  if (payload?.errors?.length) {
    throw new Error(payload.errors[0]?.message || 'Error GraphQL en tarkov.dev.');
  }

  return payload.data || {};
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readJsonString = (value) => {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
};

const findIndexedPlayer = (indexText, username) => {
  const cleanUsername = username.trim();
  const playerPattern = escapeRegExp(cleanUsername).replace(/ /g, '\\s');
  const match = String(indexText || '').match(new RegExp('"([^"]+)"\\s*:\\s*"(' + playerPattern + ')"', 'i'));
  if (!match) return null;
  return [readJsonString(match[1]), readJsonString(match[2])];
};

const findUpdatedTimestamp = (updatedText, accountId) => {
  if (!updatedText || !accountId) return null;
  const match = String(updatedText).match(new RegExp('"' + escapeRegExp(accountId) + '"\\s*:\\s*([0-9]+)'));
  return match ? toNumber(match[1]) : null;
};

const getLevelFromExperience = (experience, playerLevels) => {
  const xp = toNumber(experience);
  if (xp === null || !Array.isArray(playerLevels) || playerLevels.length === 0) return null;

  let accumulatedXp = 0;
  let currentLevel = null;

  for (const levelInfo of playerLevels) {
    const levelXp = toNumber(levelInfo?.exp);
    const level = toNumber(levelInfo?.level);

    if (levelXp === null || level === null) continue;

    accumulatedXp += levelXp;
    if (accumulatedXp > xp) break;
    currentLevel = level;
  }

  return currentLevel;
};

const getCounter = (profile, counterKeys) => {
  const counters = profile?.pmcStats?.eft?.overAllCounters?.Items;
  if (!Array.isArray(counters)) return null;

  const normalizedTarget = counterKeys.map(String).join('|').toLowerCase();
  const counter = counters.find((entry) => {
    if (!Array.isArray(entry?.Key)) return false;
    return entry.Key.map(String).join('|').toLowerCase() === normalizedTarget;
  });

  return toNumber(counter?.Value);
};

const getSkillsSummary = (profile, skillsCatalog = new Map()) => {
  const commonSkills = profile?.skills?.Common;
  if (!Array.isArray(commonSkills)) return [];

  return commonSkills
    .map((skill) => {
      const id = skill?.Id || skill?.id || 'Skill';
      const catalogSkill = skillsCatalog.get(id) || skillsCatalog.get(String(id).toLowerCase());
      return {
        id,
        name: catalogSkill?.name || id,
        imageLink: catalogSkill?.imageLink || null,
        progress: toNumber(skill?.Progress ?? skill?.progress) || 0,
        lastAccess: normalizeTimestamp(skill?.LastAccess)
      };
    })
    .filter((skill) => skill.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .map((skill) => ({
      ...skill,
      level: Math.min(51, skill.progress / 100)
    }));
};

const titleFromSlug = (value) =>
  String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const readableName = (value, fallback) => {
  const text = String(value || '').trim();
  if (!text || /^[a-f0-9]{24} name$/i.test(text)) return fallback;
  return text;
};

const getAccountCategory = (memberCategory) => {
  const category = toNumber(memberCategory);
  if (!category) return null;

  const flags = Object.entries(MEMBER_FLAGS)
    .filter(([, flag]) => category & flag)
    .map(([name]) => name);

  return flags.length ? flags.join(', ') : `Categoria ${category}`;
};

const summarizeItem = (item, itemMap) => {
  const templateId = item?._tpl;
  const itemInfo = itemMap.get(templateId);

  if (!itemInfo) return null;

  return {
    id: item?._id,
    templateId,
    slotId: item?.slotId || null,
    name: itemInfo.name || itemInfo.shortName || templateId || 'Item',
    shortName: itemInfo.shortName || itemInfo.name || templateId || 'Item',
    iconLink: itemInfo?.iconLink || itemInfo?.gridImageLink || itemInfo?.baseImageLink || null
  };
};

const getRootItems = (items, itemMap, limit = 8) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => !item.parentId || ['Scabbard', 'SecuredContainer', 'ArmBand', 'FirstPrimaryWeapon', 'SecondPrimaryWeapon', 'Holster', 'Headwear', 'FaceCover', 'ArmorVest', 'TacticalVest', 'Backpack', 'Eyewear'].includes(item.slotId))
    .map((item) => summarizeItem(item, itemMap))
    .filter(Boolean)
    .slice(0, limit);
};

const summarizeAchievements = (profileAchievements, achievementCatalog) => {
  const entries = Object.entries(profileAchievements || {});
  const completed = entries.map(([id, timestamp]) => {
    const achievement = achievementCatalog?.[id] || {};
    const normalizedName = titleFromSlug(achievement.name || id);
    return {
      id,
      name: readableName(achievement.name, normalizedName),
      rarity: achievement.normalizedRarity || 'common',
      rarityLabel: RARITY_LABELS[achievement.normalizedRarity] || achievement.normalizedRarity || 'Comun',
      imageLink: achievement.imageLink || null,
      playersCompletedPercent: toNumber(achievement.adjustedPlayersCompletedPercent ?? achievement.playersCompletedPercent),
      completedAt: normalizeTimestamp(timestamp)
    };
  });

  const all = [...completed].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const recent = all.slice(0, 8);

  const rarityScore = { legendary: 3, rare: 2, common: 1 };
  const rarest = [...completed]
    .sort((a, b) => {
      const rarityDiff = (rarityScore[b.rarity] || 0) - (rarityScore[a.rarity] || 0);
      if (rarityDiff !== 0) return rarityDiff;
      return (a.playersCompletedPercent ?? 999) - (b.playersCompletedPercent ?? 999);
    })
    .slice(0, 8);

  return { all, recent, rarest };
};

const getLastActiveAt = (payload, achievements) => {
  const skillTimes = Array.isArray(payload?.skills?.Common)
    ? payload.skills.Common.map((skill) => normalizeTimestamp(skill.LastAccess)).filter(Boolean)
    : [];
  const achievementTimes = Object.values(achievements || {}).map(normalizeTimestamp).filter(Boolean);
  const latest = Math.max(0, ...skillTimes, ...achievementTimes);
  return latest ? new Date(latest).toISOString() : null;
};

const getRelevantItemTemplates = (payload) => {
  const itemIds = new Set();
  const collect = (items, limit = 12) => {
    if (!Array.isArray(items)) return;
    getRootItems(items, new Map(items.map((item) => [item?._tpl, { id: item?._tpl }])), limit).forEach((item) => {
      if (item?.templateId) itemIds.add(item.templateId);
    });
  };

  collect(payload?.equipment?.Items, 10);
  collect(payload?.favoriteItems, 8);
  return [...itemIds].filter(Boolean);
};

const fetchPlayerLevels = async () => {
  const data = await fetchGraphql(`
    query GetPlayerLevels {
      playerLevels {
        level
        exp
      }
    }
  `);
  return data.playerLevels || [];
};

const fetchSkillsCatalog = async () => {
  const data = await fetchGraphql(`
    query GetSkillsCatalog {
      skills {
        id
        name
        imageLink
      }
    }
  `);

  return new Map((data.skills || []).flatMap((skill) => {
    const normalizedSkill = {
      name: skill.name,
      imageLink: skill.imageLink
    };
    return [
      [skill.id, normalizedSkill],
      [String(skill.id || '').toLowerCase(), normalizedSkill]
    ];
  }));
};

const fetchItemsByIds = async (ids) => {
  if (!ids.length) return new Map();

  const data = await fetchGraphql(`
    query GetProfileItems($ids: [ID]) {
      items(ids: $ids) {
        id
        name
        shortName
        iconLink
        gridImageLink
        baseImageLink
      }
    }
  `, { ids });

  return new Map((data.items || []).map((item) => [item.id, item]));
};

const fetchAchievementsCatalog = async () => {
  const [tasksPayload, translationsPayload] = await Promise.all([
    fetchJson(TARKOV_STATIC_TASKS_URL),
    fetchJson(TARKOV_STATIC_TASK_TRANSLATIONS_URL).catch(() => ({ data: {} }))
  ]);
  const achievements = tasksPayload?.data?.achievements || {};
  const translations = translationsPayload?.data || {};

  return Object.fromEntries(Object.entries(achievements).map(([id, achievement]) => {
    const translatedName = translations[achievement?.name] || titleFromSlug(achievement?.normalizedName || id);
    return [id, {
      id,
      name: translatedName,
      normalizedRarity: achievement?.normalizedRarity,
      playersCompletedPercent: achievement?.playersCompletedPercent,
      adjustedPlayersCompletedPercent: achievement?.adjustedPlayersCompletedPercent,
      imageLink: achievement?.imageLink
    }];
  }));
};

const normalizeProfile = (payload, context, dataCatalog = {}) => {
  const info = payload?.info || {};
  const experience = toNumber(info.experience);
  const raids = getCounter(payload, ['Sessions', 'Pmc']);
  const survivedRaids = getCounter(payload, ['ExitStatus', 'Survived', 'Pmc']);
  const updatedTimestamp = normalizeTimestamp(payload?.updated || context.updatedAt);
  const achievements = payload?.achievements && typeof payload.achievements === 'object' ? payload.achievements : {};
  const itemMap = dataCatalog.itemMap || new Map();
  const achievementSummary = summarizeAchievements(
    achievements,
    dataCatalog.achievementsCatalog || {}
  );

  return {
    accountId: payload?.aid || context.accountId,
    sourceUsername: context.username,
    mode: context.mode,
    nickname: info.nickname || context.username,
    level: getLevelFromExperience(experience, dataCatalog.playerLevels),
    experience,
    faction: info.side ? String(info.side).toUpperCase() : null,
    memberCategory: getAccountCategory(info.memberCategory),
    selectedMemberCategory: info.selectedMemberCategory || null,
    prestigeLevel: toNumber(info.prestigeLevel),
    updatedAt: updatedTimestamp ? new Date(updatedTimestamp).toISOString() : null,
    lastActiveAt: getLastActiveAt(payload, achievements),
    totalInGameTime: formatDuration(payload?.pmcStats?.eft?.totalInGameTime),
    raids,
    survivedRaids,
    deaths: getCounter(payload, ['Deaths']),
    kills: getCounter(payload, ['Kills']),
    killedPmcs: getCounter(payload, ['KilledPmc']),
    survivalRate: raids && survivedRaids !== null ? Math.round((survivedRaids / raids) * 100) : null,
    achievementsCount: Object.keys(achievements).length,
    favoriteItemsCount: Array.isArray(payload?.favoriteItems) ? payload.favoriteItems.length : 0,
    equipmentItemsCount: Array.isArray(payload?.equipment?.Items) ? payload.equipment.Items.length : 0,
    favoriteItems: getRootItems(payload?.favoriteItems, itemMap, 8),
    equipmentItems: getRootItems(payload?.equipment?.Items, itemMap, 10),
    allAchievements: achievementSummary.all,
    recentAchievements: achievementSummary.recent,
    rareAchievements: achievementSummary.rarest,
    skillsSummary: getSkillsSummary(payload, dataCatalog.skillsCatalog || new Map()),
    topLevelKeys: Object.keys(payload || {}).slice(0, 12),
    fetchedAt: new Date().toISOString()
  };
};

export const loadPmcProfile = async ({ username, mode }) => {
  const cleanUsername = String(username || '').trim();
  const normalizedMode = String(mode || 'PVP').toUpperCase() === 'PVE' ? 'PVE' : 'PVP';
  const baseUrl = STATIC_PLAYER_BASES[normalizedMode];

  if (!cleanUsername) {
    return jsonResponse(400, { error: 'Configura tu usuario de Tarkov en Cuenta para sincronizar el perfil.' });
  }

  const [indexText, updatedText] = await Promise.all([
    fetchText(`${baseUrl}/index.json`),
    fetchText(`${baseUrl}/updated.json`).catch(() => '')
  ]);

  const indexedPlayer = findIndexedPlayer(indexText, cleanUsername);

  if (!indexedPlayer) {
    return jsonResponse(404, {
      error: 'Este jugador no aparece aun en el indice publico de players.tarkov.dev. Abre o busca su perfil en tarkov.dev/players y espera a la actualizacion diaria del indice.'
    });
  }

  const [accountId, indexedName] = indexedPlayer;
  const profilePayload = await fetchJson(`${baseUrl}/${encodeURIComponent(accountId)}.json`);
  const relevantItemIds = getRelevantItemTemplates(profilePayload);
  const [playerLevels, itemMap, achievementsCatalog, skillsCatalog] = await Promise.all([
    fetchPlayerLevels().catch(() => []),
    fetchItemsByIds(relevantItemIds).catch(() => new Map()),
    fetchAchievementsCatalog().catch(() => ({})),
    fetchSkillsCatalog().catch(() => new Map())
  ]);

  const profile = normalizeProfile(profilePayload, {
    username: indexedName || cleanUsername,
    accountId,
    mode: normalizedMode,
    updatedAt: findUpdatedTimestamp(updatedText, accountId)
  }, {
    playerLevels,
    itemMap,
    achievementsCatalog,
    skillsCatalog
  });

  return jsonResponse(200, { profile });
};

export const handler = async (event) => {
  try {
    return await loadPmcProfile({
      username: event.queryStringParameters?.username,
      mode: event.queryStringParameters?.mode
    });
  } catch (error) {
    return jsonResponse(502, {
      error: error?.message || 'No se pudo cargar el perfil de PMC.'
    });
  }
};
