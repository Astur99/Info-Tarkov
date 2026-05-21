import { sortHideoutStations } from './hideoutUtils';

export const fetchHideoutStations = async (gameMode) => {
  const queryHideout = JSON.stringify({
    query: `
      query GetHideoutData {
        hideoutStations(gameMode: ${gameMode}) {
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
    `
  });

  const response = await fetch('https://api.tarkov.dev/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: queryHideout
  });

  const result = await response.json();

  if (!Array.isArray(result?.data?.hideoutStations)) {
    throw new Error('Hideout stations response was not available.');
  }

  const stations = sortHideoutStations(result.data.hideoutStations);

  if (stations.length === 0) {
    throw new Error('Hideout stations response was empty.');
  }

  return stations;
};
