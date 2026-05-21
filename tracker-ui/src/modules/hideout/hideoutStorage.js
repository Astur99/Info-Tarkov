import { loadModuleState, saveModuleState } from '../../lib/moduleStateSync';
import { HIDEOUT_MODULE_KEY } from './hideoutUtils';

const parseStoredObject = (value) => {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
};

export const readLocalHideoutProgress = ({ storageKey, levelStorageKey }) => ({
  items: parseStoredObject(localStorage.getItem(storageKey)),
  levels: parseStoredObject(localStorage.getItem(levelStorageKey))
});

export const writeLocalHideoutProgress = ({ storageKey, levelStorageKey, items, levels }) => {
  localStorage.setItem(storageKey, JSON.stringify(items || {}));
  localStorage.setItem(levelStorageKey, JSON.stringify(levels || {}));
};

export const loadHideoutProgress = async ({ session, mode, storageKey, levelStorageKey }) => {
  const localProgress = readLocalHideoutProgress({ storageKey, levelStorageKey });

  if (!session?.user?.id) {
    return {
      ...localProgress,
      syncStatus: 'local',
      fromCloud: false
    };
  }

  const { data, error } = await loadModuleState({
    userId: session.user.id,
    moduleKey: HIDEOUT_MODULE_KEY,
    mode
  });

  if (error) {
    console.error(error);
    return {
      ...localProgress,
      syncStatus: 'local-error',
      fromCloud: false
    };
  }

  if (data) {
    return {
      items: data.items || {},
      levels: data.levels || {},
      syncStatus: 'cloud',
      fromCloud: true
    };
  }

  const { error: saveError } = await saveModuleState({
    userId: session.user.id,
    moduleKey: HIDEOUT_MODULE_KEY,
    mode,
    state: { items: localProgress.items, levels: localProgress.levels }
  });

  return {
    ...localProgress,
    syncStatus: saveError ? 'local-error' : 'cloud',
    fromCloud: !saveError
  };
};

export const saveHideoutProgress = async ({ session, mode, storageKey, levelStorageKey, items, levels }) => {
  writeLocalHideoutProgress({ storageKey, levelStorageKey, items, levels });

  if (!session?.user?.id) {
    return 'local';
  }

  const { error } = await saveModuleState({
    userId: session.user.id,
    moduleKey: HIDEOUT_MODULE_KEY,
    mode,
    state: { items, levels }
  });

  if (error) {
    console.error(error);
    return 'local-error';
  }

  return 'cloud';
};
