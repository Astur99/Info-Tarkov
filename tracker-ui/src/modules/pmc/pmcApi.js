const ERROR_TRANSLATION_KEYS = {
  PMC_USERNAME_REQUIRED: 'pmc.errors.usernameRequired',
  PMC_PROFILE_NOT_INDEXED: 'pmc.errors.profileNotIndexed',
  PMC_UPSTREAM_UNAVAILABLE: 'pmc.errors.upstreamUnavailable'
};

export const fetchTarkovPlayerProfile = async ({ username, mode, signal }) => {
  const params = new URLSearchParams({
    username: username.trim(),
    mode,
    t: String(Date.now())
  });

  const response = await fetch(`/api/pmc-profile?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const requestError = new Error(payload?.error || `PMC profile unavailable (${response.status}).`);
    requestError.translationKey = ERROR_TRANSLATION_KEYS[payload?.errorCode] || 'pmc.errors.loadProfile';
    throw requestError;
  }

  return payload.profile;
};
