import { supabase } from './supabaseClient';

export const loadModuleState = async ({ userId, moduleKey, mode = 'GLOBAL' }) => {
  if (!userId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('user_module_state')
    .select('state')
    .eq('user_id', userId)
    .eq('module_key', moduleKey)
    .eq('mode', mode)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data: data?.state || null, error: null };
};

export const saveModuleState = async ({ userId, moduleKey, mode = 'GLOBAL', state }) => {
  if (!userId) return { error: null };

  const { error } = await supabase
    .from('user_module_state')
    .upsert(
      {
        user_id: userId,
        module_key: moduleKey,
        mode,
        state,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,module_key,mode' }
    );

  return { error };
};
