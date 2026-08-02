const SESSION_ONLY_AUTH_EVENTS = new Set([
  'TOKEN_REFRESHED',
  'MFA_CHALLENGE_VERIFIED'
]);

export const shouldReloadIdentityForAuthEvent = (event) =>
  !SESSION_ONLY_AUTH_EVENTS.has(event);
