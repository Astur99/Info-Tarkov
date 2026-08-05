import { createClient } from '@supabase/supabase-js';

const env = globalThis.process?.env || {};
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://fannlkktvoxcwvxbmwcy.supabase.co';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Bg1PipWT97F8FYodvnCqPg_N892ahhl';
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_EMAIL = 'juancarfele@gmail.com';
const ALLOWED_ORIGINS = new Set([
  'https://infotarkov.com',
  'https://www.infotarkov.com',
  'http://localhost:5173'
]);

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0'
  },
  body: JSON.stringify(body)
});

const decodeClaims = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(globalThis.Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return {};
  }
};

const cleanText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const hasRecentTotp = (claims, maxAgeSeconds = 180) => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return (Array.isArray(claims.amr) ? claims.amr : []).some((method) => {
    const timestamp = Number(method?.timestamp);
    return method?.method === 'totp' && Number.isFinite(timestamp) && timestamp <= nowSeconds + 30 && timestamp >= nowSeconds - maxAgeSeconds;
  });
};

const getRedirectOrigin = (event) => {
  const origin = cleanText(event.headers?.origin, 200);
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://infotarkov.com';
};

const writeAudit = async (service, adminUserId, action, targetUserId, metadata = {}) => {
  await service.from('admin_audit_log').insert({
    admin_user_id: adminUserId,
    request_path: '/api/admin-user-account',
    request_method: 'POST',
    action,
    target_user_id: targetUserId,
    metadata
  });
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return response(405, { error: 'Method not allowed.' });
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return response(503, { error: 'The protected administration backend is not configured.' });
  }

  const token = String(event.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return response(401, { error: 'Authentication required.' });

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: authData, error: authError } = await service.auth.getUser(token);
  const admin = authData?.user;
  if (authError || !admin) return response(401, { error: 'Invalid or expired session.' });
  const claims = decodeClaims(token);
  if (claims.aal !== 'aal2' || !hasRecentTotp(claims)) {
    return response(403, { error: 'Fresh MFA verification required.' });
  }

  const { data: roleRow } = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', admin.id)
    .maybeSingle();
  if (roleRow?.role !== 'admin') return response(403, { error: 'Administrator access required.' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return response(400, { error: 'Invalid JSON body.' });
  }

  const action = cleanText(payload.action, 50);
  const targetUserId = cleanText(payload.targetUserId, 64);
  if (!targetUserId) return response(400, { error: 'Target user is required.' });

  const { data: targetData, error: targetError } = await service.auth.admin.getUserById(targetUserId);
  const target = targetData?.user;
  if (targetError || !target) return response(404, { error: 'User not found.' });

  const targetIsOwner = String(target.email || '').toLowerCase() === OWNER_EMAIL;

  try {
    if (action === 'update_profile') {
      const username = cleanText(payload.username, 20);
      const tarkovUsername = cleanText(payload.tarkovUsername || username, 20);
      const primaryGameMode = cleanText(payload.primaryGameMode, 4).toUpperCase();
      if (!/^[A-Za-z0-9_-]{3,20}$/.test(username) || !/^[A-Za-z0-9_-]{3,20}$/.test(tarkovUsername)) {
        return response(400, { error: 'Invalid username format.' });
      }
      if (!['PVP', 'PVE', 'SEASONAL_PVP', 'BOTH'].includes(primaryGameMode)) {
        return response(400, { error: 'Invalid game mode.' });
      }

      const { error } = await service.from('user_profiles').upsert({
        user_id: targetUserId,
        username,
        tarkov_username: tarkovUsername,
        primary_game_mode: primaryGameMode,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) throw error;

      const metadata = { ...(target.user_metadata || {}), username, tarkov_username: tarkovUsername, primary_game_mode: primaryGameMode };
      const { error: metadataError } = await service.auth.admin.updateUserById(targetUserId, { user_metadata: metadata });
      if (metadataError) throw metadataError;
      await writeAudit(service, admin.id, action, targetUserId, { username, primaryGameMode });
      return response(200, { ok: true });
    }

    if (action === 'set_role') {
      if (targetIsOwner) return response(403, { error: 'The owner role cannot be modified.' });
      const role = cleanText(payload.role, 10);
      if (!['admin', 'user'].includes(role)) return response(400, { error: 'Invalid role.' });
      const { error } = await service.from('user_roles').upsert({ user_id: targetUserId, role }, { onConflict: 'user_id' });
      if (error) throw error;
      await writeAudit(service, admin.id, action, targetUserId, { role });
      return response(200, { ok: true });
    }

    if (action === 'delete_user') {
      if (targetIsOwner || targetUserId === admin.id) return response(403, { error: 'This protected account cannot be deleted here.' });
      const { error } = await service.auth.admin.deleteUser(targetUserId);
      if (error) throw error;
      await writeAudit(service, admin.id, action, targetUserId);
      return response(200, { ok: true });
    }

    if (action === 'send_password_recovery') {
      const { error } = await publicClient.auth.resetPasswordForEmail(target.email, {
        redirectTo: `${getRedirectOrigin(event)}/?view=account`
      });
      if (error) throw error;
      await writeAudit(service, admin.id, action, targetUserId);
      return response(200, { ok: true });
    }

    if (action === 'request_email_change') {
      const newEmail = cleanText(payload.newEmail, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return response(400, { error: 'Invalid email address.' });
      if (newEmail === String(target.email || '').toLowerCase()) return response(400, { error: 'The new email is unchanged.' });

      const { error } = await service.from('admin_email_change_requests').upsert({
        user_id: targetUserId,
        requested_email: newEmail,
        requested_by: admin.id,
        requested_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) throw error;
      await writeAudit(service, admin.id, action, targetUserId, { requestedEmailDomain: newEmail.split('@')[1] });
      return response(200, { ok: true });
    }

    return response(400, { error: 'Unsupported action.' });
  } catch (error) {
    console.error('Protected admin action failed', action, error);
    return response(500, { error: error?.message || 'The protected action failed.' });
  }
};
