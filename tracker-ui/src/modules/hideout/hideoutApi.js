import { sortHideoutStations } from './hideoutUtils';
import {
  loadJsonHideoutStations,
  normalizeTarkovGameMode
} from '../../services/tarkovDataApi';

export const fetchHideoutStations = async (gameMode, locale = 'en') => {
  const mode = normalizeTarkovGameMode(gameMode);
  const stations = sortHideoutStations(
    await loadJsonHideoutStations({ gameMode: mode, locale })
  );
  if (!stations.length) {
    throw new Error('Hideout JSON response was empty.');
  }
  return { stations, source: 'json' };
};
