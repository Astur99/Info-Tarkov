import {
  findJsonItemsByNames,
  loadJsonPriceHistory,
  normalizeTarkovGameMode,
  searchJsonItems
} from '../../services/tarkovDataApi';

export const searchFleaItems = async ({
  query,
  gameMode,
  locale,
  signal
}) => {
  const mode = normalizeTarkovGameMode(gameMode);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return {
    items: await searchJsonItems({ query, gameMode: mode, locale }),
    source: 'json'
  };
};

export const fetchFleaHotDeals = async ({
  names,
  gameMode,
  locale,
  signal
}) => {
  const mode = normalizeTarkovGameMode(gameMode);

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return {
    items: await findJsonItemsByNames({ names, gameMode: mode, locale }),
    source: 'json'
  };
};

export const fetchFleaPriceHistory = async ({ itemId, gameMode, signal }) => {
  const samples = await loadJsonPriceHistory({ itemId, gameMode, signal });
  const latest = samples.at(-1);

  return {
    historicalPrices: samples,
    lastLowPrice: latest?.priceMin || 0,
    lastOfferCount: latest?.offerCount || 0,
    updated: latest?.timestamp || null
  };
};
