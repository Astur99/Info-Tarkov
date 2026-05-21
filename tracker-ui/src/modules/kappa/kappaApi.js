import { collectorItemNames } from './kappaData';
import { normalizeCollectorName } from './kappaUtils';

const collectorItemsQuery = `
  query GetCollectorItems($names: [String]) {
    items(names: $names) {
      id
      name
      shortName
      iconLink
      imageLink
      wikiLink
    }
  }
`;

const tasksQuery = `
  {
    tasks {
      id
      name
      wikiLink
      kappaRequired
      trader {
        name
      }
      taskRequirements {
        task {
          id
          name
          trader {
            name
          }
        }
      }
    }
  }
`;

const postTarkovQuery = async (body) => {
  const response = await fetch('https://api.tarkov.dev/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error('tarkov.dev request failed');
  return response.json();
};

export const fetchCollectorItemAssets = async () => {
  const response = await postTarkovQuery({
    query: collectorItemsQuery,
    variables: { names: collectorItemNames }
  });

  const assets = {};
  (response.data?.items || []).forEach((item) => {
    assets[normalizeCollectorName(item.name)] = item;
  });

  return assets;
};

export const fetchKappaTasks = async () => {
  const response = await postTarkovQuery({ query: tasksQuery });
  return response.data?.tasks || [];
};
