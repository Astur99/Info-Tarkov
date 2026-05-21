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
    throw new Error(payload?.error || `Perfil de PMC no disponible (${response.status}).`);
  }

  return payload.profile;
};
