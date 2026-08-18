export const KORD_PROFILE_LIMITS = Object.freeze({
  season: 25,
  pvp: 15,
  pve: 10
});

export const KORD_RAID_DOCUMENT_LIMIT = 4;

export const getBattlePassDocumentTotals = (rewards = []) => {
  const totals = {};
  rewards.forEach((reward) => {
    reward.requirements?.forEach(({ documentId, count }) => {
      totals[documentId] = (totals[documentId] || 0) + Number(count || 0);
    });
  });
  return totals;
};

export const getRemainingDocuments = (required = {}, inventory = {}) =>
  Object.fromEntries(
    Object.entries(required).map(([documentId, count]) => [
      documentId,
      Math.max(0, Number(count || 0) - Number(inventory[documentId] || 0))
    ])
  );

export const rankDocumentFarmMaps = ({ documents = [], remaining = {} } = {}) => {
  const maps = new Map();

  documents
    .filter((document) => !document.wildcard)
    .forEach((document) => {
      const needed = Number(remaining[document.id] || 0);
      document.maps.forEach((mapName) => {
        const entry = maps.get(mapName) || { mapName, documents: [], totalNeeded: 0 };
        entry.documents.push({ id: document.id, name: document.name, needed });
        entry.totalNeeded += needed;
        maps.set(mapName, entry);
      });
    });

  return [...maps.values()]
    .map((entry) => ({
      ...entry,
      usefulTypes: entry.documents.filter((document) => document.needed > 0).length,
      score: entry.totalNeeded + entry.documents.filter((document) => document.needed > 0).length * 20
    }))
    .filter((entry) => entry.usefulTypes > 0)
    .sort((left, right) =>
      right.usefulTypes - left.usefulTypes
      || right.totalNeeded - left.totalNeeded
      || left.mapName.localeCompare(right.mapName)
    );
};

export const estimateDocumentProgress = ({ remaining = {}, dailyLimit, wildcardId } = {}) => {
  const farmableRemaining = Object.entries(remaining)
    .filter(([documentId]) => documentId !== wildcardId)
    .reduce((total, [, count]) => total + Number(count || 0), 0);
  const totalRemaining = Object.values(remaining)
    .reduce((total, count) => total + Number(count || 0), 0);

  return {
    totalRemaining,
    farmableRemaining,
    estimatedRaids: Math.ceil(farmableRemaining / KORD_RAID_DOCUMENT_LIMIT),
    estimatedDays: dailyLimit > 0 ? Math.ceil(farmableRemaining / dailyLimit) : 0
  };
};

export const recommendWildcardUse = ({ remaining = {}, wildcardId, available = 0 } = {}) => {
  let left = Math.max(0, Number(available || 0));
  return Object.entries(remaining)
    .filter(([documentId, count]) => documentId !== wildcardId && count > 0)
    .sort((leftEntry, rightEntry) => rightEntry[1] - leftEntry[1])
    .map(([documentId, count]) => {
      const use = Math.min(Number(count), left);
      left -= use;
      return { documentId, count: use };
    })
    .filter((entry) => entry.count > 0);
};

export const getLocalDayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const normalizeDailyDocumentProgress = (value, date = new Date()) => {
  const day = getLocalDayKey(date);
  if (!value || value.day !== day) {
    return { day, counts: { season: 0, pvp: 0, pve: 0 } };
  }

  return {
    day,
    counts: Object.fromEntries(
      Object.entries(KORD_PROFILE_LIMITS).map(([profile, limit]) => [
        profile,
        Math.min(limit, Math.max(0, Number(value.counts?.[profile] || 0)))
      ])
    )
  };
};
