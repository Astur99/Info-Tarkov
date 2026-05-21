export const MARKET_MODES = {
  PVP: 'regular',
  PVE: 'pve'
};

export const STORAGE_PREFIX = 'info_tarkov_hideout_items';
export const LEVEL_STORAGE_PREFIX = 'info_tarkov_hideout_levels';
export const HIDEOUT_MODULE_KEY = 'hideout_progress';

const NATURAL_STATION_ORDER = [
  'Stash',
  'Security',
  'Vents',
  'Generator',
  'Illumination',
  'Heating',
  'Lavatory',
  'Workbench',
  'Medstation',
  'Nutrition Unit',
  'Rest Space',
  'Water Collector',
  'Shooting Range',
  'Gym',
  'Defective Wall',
  'Booze Generator',
  'Intelligence Center',
  'Library',
  'Bitcoin Farm',
  'Scav Case',
  'Air Filtering Unit',
  'Solar Power',
  'Gear Rack',
  'Cultist Circle',
  'Weapon Rack',
  'Hall of Fame'
];

export const poolHideoutLocal = [
  {
    id: 'h1',
    name: 'Workbench',
    imageLink: 'https://assets.tarkov.dev/5d484fc0654e76006657e335-image.png',
    levels: [
      {
        id: 'h1-l1',
        level: 1,
        constructionTime: 14400,
        traderRequirements: [{ trader: { name: 'Mechanic' }, value: 1 }],
        stationLevelRequirements: [],
        skillRequirements: [],
        itemRequirements: [
          {
            id: 'h1-l1-i1',
            item: {
              id: 'i1',
              name: 'Multitool',
              shortName: 'Tool',
              lastLowPrice: 25000,
              iconLink: 'https://assets.tarkov.dev/544fb5454bdc2df8738b456f-icon.png'
            },
            count: 1,
            quantity: 1,
            attributes: []
          }
        ]
      }
    ]
  }
];

export const getHideoutStorageKeys = (mode) => ({
  storageKey: `${STORAGE_PREFIX}_${mode.toLowerCase()}`,
  levelStorageKey: `${LEVEL_STORAGE_PREFIX}_${mode.toLowerCase()}`
});

export const getStationOrderScore = (station) => {
  const manualIndex = NATURAL_STATION_ORDER.findIndex(
    (name) => name.toLowerCase() === station?.name?.toLowerCase()
  );

  if (manualIndex >= 0) return manualIndex;

  const firstLevel = station?.levels?.[0];
  const dependencyWeight = firstLevel?.stationLevelRequirements?.length || 0;
  const traderWeight = firstLevel?.traderRequirements?.length || 0;
  const skillWeight = firstLevel?.skillRequirements?.length || 0;

  return 100 + dependencyWeight * 8 + traderWeight * 4 + skillWeight * 4;
};

export const sortHideoutStations = (stations) =>
  stations
    .filter((station) => station && station.name)
    .map((station) => ({
      ...station,
      levels: [...(station.levels || [])].sort((a, b) => a.level - b.level)
    }))
    .sort((a, b) => {
      const orderDiff = getStationOrderScore(a) - getStationOrderScore(b);
      return orderDiff || a.name.localeCompare(b.name);
    });

export const getRequirementKey = (mode, stationId, level, req) =>
  `${mode}:${stationId}:${level}:${req?.id || req?.item?.id || req?.item?.name}`;

export const isFirRequirement = (req) => {
  return (req?.attributes || []).some((attribute) => {
    const type = String(attribute?.type || '').toLowerCase();
    const name = String(attribute?.name || '').toLowerCase();
    const value = String(attribute?.value || '').toLowerCase();
    const key = `${type} ${name}`;
    const positiveValue = ['true', '1', 'yes', 'required', 'only'].includes(value);

    return (
      positiveValue &&
      (
        key.includes('foundinraid') ||
        key.includes('found in raid') ||
        key.includes('findinraid') ||
        key.includes('find in raid') ||
        key.includes('fir')
      )
    );
  });
};

export const getRequirementCount = (req) => req?.count || req?.quantity || 0;

export const getRequirementPrice = (req) => {
  const price = req?.item?.lastLowPrice || req?.item?.avg24hPrice || req?.item?.basePrice || 0;
  return price > 0 ? price : 0;
};

export const getHideoutProgress = (stations, builtLevels) => {
  const totalLevels = stations.reduce((sum, station) => sum + (station.levels?.length || 0), 0);
  const builtCount = stations.reduce(
    (sum, station) => sum + Math.min(builtLevels[station.id] || 0, station.levels?.length || 0),
    0
  );
  const available = stations.flatMap((station) =>
    (station.levels || []).filter((level) => {
      const current = builtLevels[station.id] || 0;
      if (level.level !== current + 1) return false;
      return (level.stationLevelRequirements || []).every(
        (req) => (builtLevels[req.station?.id] || 0) >= req.level
      );
    })
  ).length;

  return { totalLevels, builtLevels: builtCount, available };
};

export const getStationAvailability = (station, builtLevels) => {
  const builtLevel = builtLevels[station.id] || 0;
  const nextLevel = (station.levels || []).find((level) => level.level === builtLevel + 1);
  const blockedBy = (nextLevel?.stationLevelRequirements || []).filter(
    (req) => (builtLevels[req.station?.id] || 0) < req.level
  );

  if (!nextLevel) return { status: 'complete', text: 'MAX', blockedBy: [] };
  if (blockedBy.length > 0) return { status: 'blocked', text: 'BLOQ', blockedBy };
  return { status: 'available', text: `L${nextLevel.level}`, blockedBy: [] };
};

export const formatRublos = (val) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(val || 0);

export const formatConstructionTime = (seconds) => {
  if (!seconds) return 'INMEDIATO';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours <= 0) return `${minutes} MIN`;
  if (minutes <= 0) return `${hours} HORAS`;
  return `${hours}H ${minutes}M`;
};
