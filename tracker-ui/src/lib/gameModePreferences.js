export const GAME_MODE_PVP = 'PVP';
export const GAME_MODE_PVE = 'PVE';
export const GAME_MODE_BOTH = 'BOTH';
export const DEFAULT_GAME_MODE_KEY = 'info_tarkov_default_game_mode';

export const GAME_MODE_OPTIONS = [
  { value: GAME_MODE_PVP, label: 'PVP' },
  { value: GAME_MODE_PVE, label: 'PVE' },
  { value: GAME_MODE_BOTH, label: 'AMBOS' }
];

export const normalizeGameModePreference = (value, fallback = GAME_MODE_PVP) => {
  const normalized = String(value || '').trim().toUpperCase();
  if ([GAME_MODE_PVP, GAME_MODE_PVE, GAME_MODE_BOTH].includes(normalized)) return normalized;
  return fallback;
};

export const getPlayableModeFromPreference = (preference) => {
  const normalized = normalizeGameModePreference(preference);
  return normalized === GAME_MODE_BOTH ? GAME_MODE_PVP : normalized;
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
