import { supabase } from './supabaseClient';
import {
  GAME_MODE_PVP,
  getPlayableModeFromPreference,
  normalizeGameModePreference,
  saveDefaultGameModePreference
} from './gameModePreferences';

export const normalizeTarkovUsername = (value) => value.trim();

export const isValidTarkovUsername = (value) =>
  /^[A-Za-z0-9_-]{3,20}$/.test(normalizeTarkovUsername(value));

export const checkUsernameAvailability = async (username) => {
  const cleanUsername = normalizeTarkovUsername(username);

  const rpcResult = await supabase.rpc('is_username_available', {
    candidate_username: cleanUsername
  });

  if (!rpcResult.error) {
    return {
      available: Boolean(rpcResult.data),
      error: null
    };
  }

  const profileResult = await supabase
    .from('user_profiles')
    .select('user_id')
    .or(`username.ilike.${cleanUsername},tarkov_username.ilike.${cleanUsername}`)
    .limit(1);

  if (!profileResult.error) {
    return {
      available: (profileResult.data || []).length === 0,
      error: null
    };
  }

  const legacyResult = await supabase
    .from('user_profiles')
    .select('user_id')
    .ilike('username', cleanUsername)
    .limit(1);

  if (legacyResult.error) {
    return {
      available: false,
      error: legacyResult.error
    };
  }

  return {
    available: (legacyResult.data || []).length === 0,
    error: null
  };
};

export const buildProfileFromSessionMetadata = (session) => {
  const metadata = session?.user?.user_metadata || {};
  const username = metadata.tarkov_username || metadata.username || '';
  const primaryGameMode = normalizeGameModePreference(metadata.primary_game_mode, GAME_MODE_PVP);

  if (!username) return null;

  return {
    username,
    tarkov_username: username,
    primary_game_mode: primaryGameMode
  };
};

export const saveUserProfilePreferences = async ({
  userId,
  username,
  tarkovUsername = username,
  primaryGameMode = GAME_MODE_PVP
}) => {
  const cleanUsername = normalizeTarkovUsername(username);
  const cleanTarkovUsername = normalizeTarkovUsername(tarkovUsername || username);
  const normalizedMode = normalizeGameModePreference(primaryGameMode);
  const updatedAt = new Date().toISOString();

  saveDefaultGameModePreference(normalizedMode);

  const fullPayload = {
    user_id: userId,
    username: cleanUsername,
    tarkov_username: cleanTarkovUsername,
    primary_game_mode: normalizedMode,
    updated_at: updatedAt
  };

  const fullResult = await supabase
    .from('user_profiles')
    .upsert(fullPayload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (!fullResult.error) return fullResult;

  const legacyResult = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        username: cleanUsername,
        updated_at: updatedAt
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (!legacyResult.error) {
    return {
      data: {
        ...legacyResult.data,
        tarkov_username: cleanTarkovUsername,
        primary_game_mode: normalizedMode
      },
      error: null,
      legacyFallback: true
    };
  }

  return fullResult.error?.code === '23505' ? fullResult : legacyResult;
};

export const hydrateGameModePreference = (profile, session) => {
  const metadataProfile = buildProfileFromSessionMetadata(session);
  const preference = profile?.primary_game_mode || metadataProfile?.primary_game_mode;
  if (preference) saveDefaultGameModePreference(preference);
  return getPlayableModeFromPreference(preference || GAME_MODE_PVP);
};
