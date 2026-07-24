import {
  findJsonItemsByNames,
  normalizeTarkovGameMode,
  postTarkovGraphql,
  searchJsonItems
} from '../../services/tarkovDataApi';

const fleaItemFields = `
  id
  name
  shortName
  iconLink
  width
  height
  avg24hPrice
  lastLowPrice
  historicalPrices {
    price
    timestamp
  }
  sellFor {
    price
    source
  }
`;

const normalizeItems = (items) =>
  (Array.isArray(items) ? items : items ? [items] : []).filter(Boolean);

export const searchFleaItems = async ({
  query,
  gameMode,
  locale,
  signal
}) => {
  const mode = normalizeTarkovGameMode(gameMode);
  const safeQuery = JSON.stringify(String(query || '').trim());

  try {
    const data = await postTarkovGraphql(`
      query SearchFleaItems {
        itemsByName(name: ${safeQuery}, gameMode: ${mode}) {
          ${fleaItemFields}
        }
      }
    `, { signal });

    const items = normalizeItems(data.itemsByName);
    if (items.length) return { items, source: 'graphql' };

    return {
      items: await searchJsonItems({ query, gameMode: mode, locale }),
      source: 'json'
    };
  } catch (graphqlError) {
    if (graphqlError?.name === 'AbortError') throw graphqlError;
    console.warn('Flea GraphQL search unavailable; using static JSON.', graphqlError);

    return {
      items: await searchJsonItems({ query, gameMode: mode, locale }),
      source: 'json'
    };
  }
};

export const fetchFleaHotDeals = async ({
  names,
  gameMode,
  locale,
  signal
}) => {
  const mode = normalizeTarkovGameMode(gameMode);

  try {
    const data = await postTarkovGraphql(`
      query GetHotDeals {
        items(names: ${JSON.stringify(names)}, gameMode: ${mode}) {
          ${fleaItemFields}
        }
      }
    `, { signal });

    return {
      items: normalizeItems(data.items),
      source: 'graphql'
    };
  } catch (graphqlError) {
    if (graphqlError?.name === 'AbortError') throw graphqlError;
    console.warn('Flea hot deals GraphQL unavailable; using static JSON.', graphqlError);

    return {
      items: await findJsonItemsByNames({ names, gameMode: mode, locale }),
      source: 'json'
    };
  }
};
