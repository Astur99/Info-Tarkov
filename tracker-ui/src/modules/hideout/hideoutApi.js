import { sortHideoutStations } from './hideoutUtils';
import {
  loadJsonHideoutStations,
  normalizeTarkovGameMode,
  postTarkovGraphql
} from '../../services/tarkovDataApi';

export const fetchHideoutStations = async (gameMode, locale = 'en') => {
  const mode = normalizeTarkovGameMode(gameMode);
  const queryHideout = `
      query GetHideoutData {
        hideoutStations(gameMode: ${mode}) {
          id
          name
          normalizedName
          imageLink
          levels {
            id
            level
            constructionTime
            description
            stationLevelRequirements {
              id
              level
              station {
                id
                name
                imageLink
              }
            }
            skillRequirements {
              id
              name
              level
              skill {
                id
                name
                imageLink
              }
            }
            traderRequirements {
              id
              value
              level
              trader {
                id
                name
              }
            }
            itemRequirements {
              id
              count
              quantity
              attributes {
                type
                name
                value
              }
              item {
                id
                name
                shortName
                basePrice
                avg24hPrice
                lastLowPrice
                iconLink
                wikiLink
              }
            }
          }
        }
      }
  `;

  try {
    const result = await postTarkovGraphql(queryHideout);
    const stations = sortHideoutStations(result.hideoutStations || []);
    if (!stations.length) throw new Error('Hideout stations response was empty.');
    return { stations, source: 'graphql' };
  } catch (graphqlError) {
    console.warn('Hideout GraphQL unavailable; using static JSON.', graphqlError);
    const stations = sortHideoutStations(
      await loadJsonHideoutStations({ gameMode: mode, locale })
    );
    if (!stations.length) {
      throw new Error('Hideout JSON response was empty.', { cause: graphqlError });
    }
    return { stations, source: 'json' };
  }
};
