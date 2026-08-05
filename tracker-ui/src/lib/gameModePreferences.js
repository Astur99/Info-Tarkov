export const GAME_MODE_PVP = 'PVP';
export const GAME_MODE_PVE = 'PVE';
export const GAME_MODE_SEASONAL_PVP = 'SEASONAL_PVP';
export const GAME_MODE_BOTH = 'BOTH';
export const DEFAULT_GAME_MODE_KEY = 'info_tarkov_default_game_mode';

export const PLAYABLE_GAME_MODES = [
  GAME_MODE_PVP,
  GAME_MODE_PVE,
  GAME_MODE_SEASONAL_PVP
];

export const TARKOV_JSON_GAME_MODES = {
  [GAME_MODE_PVP]: 'regular',
  [GAME_MODE_PVE]: 'pve',
  [GAME_MODE_SEASONAL_PVP]: 'pvp-season'
};

export const GAME_MODE_LABELS = {
  [GAME_MODE_PVP]: 'PVP',
  [GAME_MODE_PVE]: 'PVE',
  [GAME_MODE_SEASONAL_PVP]: 'SEASONAL PVP',
  [GAME_MODE_BOTH]: 'PVP + PVE'
};

export const GAME_MODE_OPTIONS = [
  { value: GAME_MODE_PVP, label: 'PVP' },
  { value: GAME_MODE_PVE, label: 'PVE' },
  { value: GAME_MODE_SEASONAL_PVP, label: 'SEASONAL PVP' },
  { value: GAME_MODE_BOTH, label: 'AMBOS' }
];

export const normalizeGameModePreference = (value, fallback = GAME_MODE_PVP) => {
  const normalized = String(value || '').trim().toUpperCase();
  if ([...PLAYABLE_GAME_MODES, GAME_MODE_BOTH].includes(normalized)) return normalized;
  return fallback;
};

export const getPlayableModeFromPreference = (preference) => {
  const normalized = normalizeGameModePreference(preference);
  return normalized === GAME_MODE_BOTH ? GAME_MODE_PVP : normalized;
};

export const getGameModeLabel = (mode) =>
  GAME_MODE_LABELS[normalizeGameModePreference(mode)] || GAME_MODE_LABELS[GAME_MODE_PVP];

export const getTarkovJsonGameMode = (mode) => {
  const rawMode = String(mode || '').trim().toLowerCase();
  if (['pvp-season', 'seasonal_pvp', 'seasonal pvp', 'seasonal'].includes(rawMode)) {
    return TARKOV_JSON_GAME_MODES[GAME_MODE_SEASONAL_PVP];
  }
  if (rawMode === 'pve') return TARKOV_JSON_GAME_MODES[GAME_MODE_PVE];
  return TARKOV_JSON_GAME_MODES[GAME_MODE_PVP];
};

export const readDefaultGameModePreference = (fallback = GAME_MODE_PVP) => {
  try {
    return normalizeGameModePreference(localStorage.getItem(DEFAULT_GAME_MODE_KEY), fallback);
  } catch {
    return fallback;
  }
};

export const readDefaultPlayableMode = (fallback = GAME_MODE_PVP) =>
  getPlayableModeFromPreference(readDefaultGameModePreference(fallback));

export const saveDefaultGameModePreference = (preference) => {
  const normalized = normalizeGameModePreference(preference);
  localStorage.setItem(DEFAULT_GAME_MODE_KEY, normalized);
  return normalized;
};
