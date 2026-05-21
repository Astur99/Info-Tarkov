import { supabase } from '../../lib/supabaseClient';
import { readDefaultPlayableMode } from '../../lib/gameModePreferences';

export const MODE_STORAGE_KEY = 'sherpa_modo_misiones_activo';

const STORAGE_PREFIX = 'sherpa_progreso_misiones_';
const COLLECTOR_STORAGE_PREFIX = 'info_tarkov_collector_items_';

const getStorageKey = (mode) => `${STORAGE_PREFIX}${mode.toLowerCase()}`;
const getCollectorStorageKey = (mode) => `${COLLECTOR_STORAGE_PREFIX}${mode.toLowerCase()}`;

const readJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const readActiveMode = () => {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) || readDefaultPlayableMode();
  } catch {
    return readDefaultPlayableMode();
  }
};

export const saveActiveMode = (mode) => {
  localStorage.setItem(MODE_STORAGE_KEY, mode);
};

export const readProgress = (mode) => readJson(getStorageKey(mode), []);

export const saveLocalProgress = (mode, progress) => {
  localStorage.setItem(getStorageKey(mode), JSON.stringify(progress));
};

export const readCollectorProgress = (mode) => readJson(getCollectorStorageKey(mode), {});

export const saveCollectorProgress = (mode, progress) => {
  localStorage.setItem(getCollectorStorageKey(mode), JSON.stringify(progress));
};

export const loadCloudProgress = async (userId, mode) => {
  const { data, error } = await supabase
    .from('quest_progress')
    .select('completed_task_ids')
    .eq('user_id', userId)
    .eq('mode', mode)
    .maybeSingle();

  if (error) throw error;
  return Array.isArray(data?.completed_task_ids) ? data.completed_task_ids : null;
};

export const saveCloudProgress = async (userId, mode, progress) => {
  const { error } = await supabase
    .from('quest_progress')
    .upsert(
      {
        user_id: userId,
        mode,
        completed_task_ids: progress,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,mode' }
    );

  if (error) throw error;
};
