const checks = [
  {
    name: 'Estado de servidores',
    url: 'https://json.tarkov.dev/status',
    validate: (payload) => payload?.data?.currentStatuses?.length > 0
  },
  {
    name: 'Catálogo de items / Flea / Llaves / Balística / PMC',
    url: 'https://json.tarkov.dev/regular/items',
    validate: (payload) =>
      Object.keys(payload?.data?.items || {}).length > 0 &&
      Object.values(payload?.data?.items || {}).filter((item) =>
        item?.types?.includes('keys')
      ).length >= 250 &&
      payload?.data?.playerLevels?.length > 0 &&
      payload?.data?.skills?.length > 0
  },
  {
    name: 'Hideout',
    url: 'https://json.tarkov.dev/regular/hideout',
    validate: (payload) => Object.values(payload?.data || {}).some(
      (station) => station?.id && Array.isArray(station?.levels)
    )
  },
  {
    name: 'Traders',
    url: 'https://json.tarkov.dev/regular/traders',
    validate: (payload) => Object.keys(payload?.data || {}).length >= 10
  },
  {
    name: 'Barters',
    url: 'https://json.tarkov.dev/regular/barters',
    validate: (payload) => Array.isArray(payload?.data) && payload.data.length > 100
  },
  {
    name: 'Crafts',
    url: 'https://json.tarkov.dev/regular/crafts',
    validate: (payload) => Array.isArray(payload?.data) && payload.data.length > 100
  },
  {
    name: 'Misiones / Kappa',
    url: 'https://json.tarkov.dev/regular/tasks',
    validate: (payload) => Object.keys(payload?.data?.tasks || {}).length > 0
  },
  {
    name: 'Bosses / Mapas',
    url: 'https://json.tarkov.dev/regular/maps',
    validate: (payload) =>
      Object.keys(payload?.data?.maps || {}).length > 0 &&
      Object.keys(payload?.data?.mobs || {}).length > 0 &&
      new Set(
        (Object.values(payload?.data?.maps || {}).find(
          (map) => map?.normalizedName === 'shoreline'
        )?.locks || []).map((lock) => lock?.key).filter(Boolean)
      ).size >= 30
  },
  {
    name: 'Histórico Flea',
    url: 'https://json.tarkov.dev/regular/prices/5c0530ee86f774697952d952',
    validate: (payload) => Array.isArray(payload?.data) && payload.data.length > 0
  }
];

let failures = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url, {
      headers: { Accept: 'application/json', 'User-Agent': 'InfoTarkov-Smoke/1.2.12' }
    });
    const payload = await response.json();
    const valid = response.ok && check.validate(payload);
    console.log(`${valid ? 'OK' : 'FAIL'}  ${check.name} (${response.status})`);
    if (!valid) failures += 1;
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${check.name} (${error.message})`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} comprobaciones híbridas han fallado.`);
  process.exit(1);
}

console.log('\nTodas las fuentes JSON críticas responden con datos válidos.');
