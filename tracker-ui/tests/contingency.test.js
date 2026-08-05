import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProfileCatalog } from '../netlify/functions/lib/static-items-catalog.js';
import {
  clearServerStatusCache,
  fetchServerStatus,
  normalizeStatusPayload
} from '../src/modules/server-status/serverStatusApi.js';
import { mergeBossSpawnData } from '../src/modules/bosses/bossesApi.js';
import { handler as goonsHandler } from '../netlify/functions/goons-tracker.js';
import { buildKeyMapIndex, isKeyItem } from '../src/modules/keys/keysApi.js';
import { getGlobalHideoutNeeds, getRequirementKey } from '../src/modules/hideout/hideoutUtils.js';
import { parseReaderTimeline, parseTimelineHtml } from '../netlify/functions/tarkov-news.js';
import { buildHealthReport } from '../netlify/functions/lib/app-health.js';
import {
  GAME_MODE_SEASONAL_PVP,
  getTarkovJsonGameMode,
  normalizeGameModePreference
} from '../src/lib/gameModePreferences.js';
import {
  BATTLE_PASS_DOCUMENTS,
  BATTLE_PASS_PAGES,
  BATTLE_PASS_REWARDS,
  calculateModifierBalance,
  getBattlePassProgressRequirements,
  getBattlePassRewardTags,
  GLOBAL_MODIFIERS,
  PERSONAL_MODIFIERS,
  searchBattlePassRewards
} from '../src/modules/seasonal/seasonalData.js';
import wikiAchievements from '../src/modules/achievements/wikiAchievements.generated.json' with { type: 'json' };

const response = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body
});

test('official news parser keeps @tarkov posts in reverse chronological order', () => {
  const tweet = (id, createdAt) => ({
    id_str: id,
    full_text: `Post ${id}`,
    created_at: createdAt,
    permalink: `/tarkov/status/${id}`,
    user: { name: 'Escape from Tarkov', screen_name: 'tarkov' }
  });
  const payload = {
    props: {
      pageProps: {
        timeline: {
          entries: [
            { type: 'tweet', content: { tweet: tweet('old', 'Wed Dec 28 05:12:54 +0000 2022') } },
            { type: 'tweet', content: { tweet: tweet('new', 'Thu Jun 18 14:00:13 +0000 2026') } }
          ]
        }
      }
    }
  };
  const posts = parseTimelineHtml(
    `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script>`
  );

  assert.deepEqual(posts.map((post) => post.id), ['new', 'old']);
  assert.equal(posts[0].createdAt, '2026-06-18T14:00:13.000Z');
});

test('official news reader fallback parses current posts, media and compact metrics', () => {
  const payload = {
    data: {
      content: [
        '* [![Image 1: user avatar](https://pbs.twimg.com/profile_images/avatar.jpg)](https://twitter.com/tarkov) [Escape from Tarkov](https://x.com/tarkov) [@tarkov](https://x.com/tarkov) [7h](https://twitter.com/tarkov/status/2083906294348406919) [#EscapefromTarkov](https://x.com/hashtag/EscapefromTarkov)  [![Image 2](https://pbs.twimg.com/media/example?format=webp&name=small)](https://twitter.com/tarkov/status/2083906294348406919/photo/1) 7 35 487 [](https://twitter.com/tarkov/status/2083906294348406919/quotes)',
        '* [![Image 3: user avatar](https://pbs.twimg.com/profile_images/avatar.jpg)](https://twitter.com/tarkov) [Escape from Tarkov](https://x.com/tarkov) [@tarkov](https://x.com/tarkov) [3h](https://twitter.com/tarkov/status/2083967990282719470) Tomorrow we are planning to install patch 1.1.0.0.    89 321 1.5K [](https://twitter.com/tarkov/status/2083967990282719470/quotes)'
      ].join('\n')
    }
  };

  const posts = parseReaderTimeline(payload);
  assert.deepEqual(posts.map((post) => post.id), ['2083967990282719470', '2083906294348406919']);
  assert.equal(posts[0].text, 'Tomorrow we are planning to install patch 1.1.0.0.');
  assert.equal(posts[0].metrics.likes, 1500);
  assert.equal(posts[1].text, '#EscapefromTarkov');
  assert.equal(posts[1].media[0].url, 'https://pbs.twimg.com/media/example?format=webp&name=small');
  assert.equal(posts[0].createdAt, '2026-08-02T17:27:41.793Z');
});

test('health monitor validates critical PVP, PVE and Seasonal PVP JSON sources', async () => {
  const makeResponse = (url) => {
    if (url.includes('/api/tarkov-news')) {
      return { ok: true, status: 200, json: async () => ({ posts: [{ id: 'post-1' }] }) };
    }
    const path = new URL(url).pathname;
    let data;
    if (path.endsWith('/items')) {
      data = { items: Object.fromEntries(Array.from({ length: 2000 }, (_, index) => [
        `item-${index}`,
        { id: `item-${index}`, types: index < 256 ? ['keys'] : ['barter'] }
      ])) };
    } else if (path.endsWith('/tasks')) {
      data = { tasks: Object.fromEntries(Array.from({ length: 300 }, (_, index) => [`task-${index}`, {}])) };
    } else if (path.endsWith('/hideout')) {
      data = Object.fromEntries(Array.from({ length: 20 }, (_, index) => [`station-${index}`, {}]));
    } else {
      data = {
        maps: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [`map-${index}`, {}])),
        goonReports: [{}]
      };
    }
    return { ok: true, status: 200, json: async () => ({ data }) };
  };

  const report = await buildHealthReport({ fetchImpl: async (url) => makeResponse(url) });
  assert.equal(report.overall, 'operational');
  assert.equal(report.modules.length, 7);
  assert.equal(report.sources.find((source) => source.id === 'items-pvp').details.keys, 256);
  assert.equal(report.sources.find((source) => source.id === 'items-seasonal-pvp').details.keys, 256);
});

test('Seasonal PVP is normalized as an independent playable JSON mode', () => {
  assert.equal(normalizeGameModePreference('seasonal_pvp'), GAME_MODE_SEASONAL_PVP);
  assert.equal(getTarkovJsonGameMode(GAME_MODE_SEASONAL_PVP), 'pvp-season');
  assert.equal(getTarkovJsonGameMode('pvp-season'), 'pvp-season');
  assert.equal(getTarkovJsonGameMode('PVE'), 'pve');
  assert.equal(getTarkovJsonGameMode('PVP'), 'regular');
});

test('KORD BREACH modifier builds require a non-negative point balance', () => {
  assert.equal(calculateModifierBalance(['street-tax']), -1);
  assert.equal(calculateModifierBalance(['street-tax', 'third-leg']), 0);
  assert.equal(calculateModifierBalance(['kappa-protocol', 'no-flea-market']), -2);
});

test('KORD BREACH exposes the complete current perk catalog with local icons', () => {
  assert.equal(GLOBAL_MODIFIERS.length, 6);
  assert.equal(PERSONAL_MODIFIERS.filter((modifier) => modifier.type === 'positive').length, 19);
  assert.equal(PERSONAL_MODIFIERS.filter((modifier) => modifier.type === 'negative').length, 14);
  assert.equal(
    [...GLOBAL_MODIFIERS, ...PERSONAL_MODIFIERS].every((modifier) => modifier.icon.endsWith('.webp')),
    true
  );
});

test('KORD BREACH tracks every Battle Pass document type without duplicate ids', () => {
  assert.equal(BATTLE_PASS_DOCUMENTS.length, 9);
  assert.equal(new Set(BATTLE_PASS_DOCUMENTS.map((document) => document.id)).size, 9);
  assert.equal(BATTLE_PASS_DOCUMENTS.filter((document) => document.wildcard).length, 1);
});

test('KORD BREACH Battle Pass keeps all 12 pages and validated document costs consistent', () => {
  const documentIds = new Set(BATTLE_PASS_DOCUMENTS.map((document) => document.id));
  const verifiedRewards = BATTLE_PASS_REWARDS.filter((reward) => reward.verifiedRequirements);

  assert.equal(BATTLE_PASS_PAGES.length, 12);
  assert.equal(BATTLE_PASS_REWARDS.length, 53);
  assert.equal(new Set(BATTLE_PASS_REWARDS.map((reward) => reward.id)).size, 53);
  assert.equal(BATTLE_PASS_REWARDS.every((reward) => Boolean(reward.imageLink)), true);
  assert.equal(BATTLE_PASS_REWARDS.filter((reward) => !reward.nameVerified).length, 0);
  assert.deepEqual(
    BATTLE_PASS_REWARDS.find((reward) => reward.id === 'overview-bp-005'),
    {
      id: 'overview-bp-005',
      page: 1,
      position: 5,
      name: 'Black Wood Ceiling',
      nameEs: 'Techo de madera negra',
      type: 'hideout customization',
    requirements: [
      { documentId: '6a31824878450ec91c0ea1ae', count: 2 },
      { documentId: '6a3181f178450ec91c0ea1aa', count: 2 },
      { documentId: '6a3182dc6cd8de21cf0a3a7d', count: 1 }
    ],
      imageLink: '/images/kord-breach/battle-pass/season-one-background.webp',
      nameVerified: true,
    verifiedRequirements: true
    }
  );
  const correctedRewards = Object.fromEntries(
    ['007', '009', '013', '025', '026', '027', '047'].map((number) => {
      const id = `overview-bp-${number}`;
      return [id, BATTLE_PASS_REWARDS.find((reward) => reward.id === id)];
    })
  );
  assert.equal(correctedRewards['overview-bp-007'].name, 'Red Hawaii');
  assert.deepEqual(
    {
      name: correctedRewards['overview-bp-009'].name,
      type: correctedRewards['overview-bp-009'].type,
      imageLink: correctedRewards['overview-bp-009'].imageLink
    },
    {
      name: 'Scorpion Target',
      type: 'hideout customization',
      imageLink: '/images/kord-breach/battle-pass/scorpion-target.webp'
    }
  );
  assert.deepEqual(
    {
      name: correctedRewards['overview-bp-013'].name,
      type: correctedRewards['overview-bp-013'].type,
      nameVerified: correctedRewards['overview-bp-013'].nameVerified
    },
    { name: 'Black Herringbone', type: 'hideout customization', nameVerified: true }
  );
  assert.deepEqual(correctedRewards['overview-bp-025'].requirements.map(({ count }) => count), [3, 2, 2]);
  assert.deepEqual(correctedRewards['overview-bp-026'].requirements.map(({ count }) => count), [4, 4, 3, 2]);
  assert.deepEqual(correctedRewards['overview-bp-027'].requirements.map(({ count }) => count), [4, 3, 3, 2]);
  assert.equal(
    correctedRewards['overview-bp-047'].imageLink,
    '/images/kord-breach/battle-pass/dogtag-bitten.webp'
  );
  assert.equal(verifiedRewards.length, 53);
  assert.equal(
    verifiedRewards.every((reward) => reward.requirements.every(
      ({ documentId, count }) => documentIds.has(documentId) && Number.isInteger(count) && count > 0
    )),
    true
  );
});

test('KORD BREACH Battle Pass search resolves names, common aliases and category tags', () => {
  const exactResult = searchBattlePassRewards({ query: 'Scorpion Target' });
  const clothingResults = searchBattlePassRewards({ query: 'ropa' });
  const dogtagResults = searchBattlePassRewards({ tag: 'dogtags' });
  const tarcoinResults = searchBattlePassRewards({ query: 'tarcoins' });

  assert.equal(exactResult[0].id, 'overview-bp-009');
  assert.equal(exactResult[0].page, 2);
  assert.equal(clothingResults.length > 0, true);
  assert.equal(
    clothingResults.every((reward) => getBattlePassRewardTags(reward).includes('clothing')),
    true
  );
  assert.equal(dogtagResults.every((reward) => reward.type === 'dogtag'), true);
  assert.equal(tarcoinResults.every((reward) => reward.type === 'currency'), true);
});

test('KORD BREACH cumulative wishlist totals share the route to its furthest reward', () => {
  const earlierPlan = getBattlePassProgressRequirements(['overview-bp-025']);
  const laterPlan = getBattlePassProgressRequirements(['overview-bp-047']);
  const combinedPlan = getBattlePassProgressRequirements([
    'overview-bp-025',
    'overview-bp-047'
  ]);

  assert.equal(earlierPlan.furthestReward.id, 'overview-bp-025');
  assert.equal(combinedPlan.furthestReward.id, 'overview-bp-047');
  assert.deepEqual(combinedPlan.totals, laterPlan.totals);
  assert.equal(combinedPlan.knownTotal, laterPlan.knownTotal);
  assert.equal(laterPlan.knownTotal > earlierPlan.knownTotal, true);
  assert.equal(combinedPlan.unverifiedRewards.length, 0);
});

test('achievement archive separates Tarkov, events, Seasonal and Arena catalogs', () => {
  const counts = wikiAchievements.achievements.reduce((result, achievement) => ({
    ...result,
    [achievement.category]: (result[achievement.category] || 0) + 1
  }), {});

  assert.deepEqual(counts, {
    normal: 88,
    seasonal: 11,
    event: 23,
    arena: 79,
    'arena-event': 4,
    retired: 1
  });
});

test('PMC static catalog extracts only requested metadata and items', () => {
  const catalog = JSON.stringify({
    data: {
      items: {
        wanted: {
          id: 'wanted',
          name: 'Wanted { item }',
          iconLink: 'https://assets.test/wanted.png'
        },
        ignored: { id: 'ignored', name: 'Ignored' }
      },
      playerLevels: [{ level: 1, exp: 0 }, { level: 2, exp: 1000 }],
      skills: [{ id: 'Endurance', name: 'Endurance', imageLink: 'endurance.webp' }]
    }
  });

  const translations = JSON.stringify({
    data: {
      'Wanted { item }': 'Wanted item',
      'wanted short': 'Wanted'
    }
  });
  const parsed = parseProfileCatalog(catalog, ['wanted'], translations);
  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.items[0].id, 'wanted');
  assert.equal(parsed.items[0].name, 'Wanted item');
  assert.equal(parsed.playerLevels[1].level, 2);
  assert.equal(parsed.skills[0].id, 'Endurance');
});

test('server status normalizes official numeric JSON states', () => {
  const statuses = normalizeStatusPayload({
    data: {
      currentStatuses: [
        { name: 'Website', status: 0, statusCode: 'OK' },
        { name: 'Trading', status: 1 },
        { name: 'Matchmaking', status: 2 }
      ]
    }
  });

  assert.deepEqual(statuses.map((item) => item.status), ['ok', 'degraded', 'down']);
});

test('server status prefers JSON and falls back to the last valid JSON snapshot', async () => {
  clearServerStatusCache();
  const jsonResult = await fetchServerStatus(async () =>
    response({
      data: { currentStatuses: [{ name: 'Website', statusCode: 'OK' }] }
    })
  );
  assert.equal(jsonResult.source, 'json');

  const fallbackResult = await fetchServerStatus(async () =>
    response({}, { ok: false, status: 503 })
  );
  assert.equal(fallbackResult.source, 'cache');
  assert.equal(fallbackResult.stale, true);
  assert.equal(fallbackResult.statuses[0].name, 'Website');
});

test('server status never invents operational data when every source fails', async () => {
  clearServerStatusCache();
  await assert.rejects(
    fetchServerStatus(async () => response({}, { ok: false, status: 503 })),
    /JSON status unavailable/
  );
});

test('Bosses merges JSON spawn chances with local tactical dossiers', () => {
  const localBosses = [{
    id: 'tagilla',
    name: 'TAGILLA',
    mapa: 'Fallback',
    spawn: '10%'
  }];
  const payload = {
    data: {
      mobs: {
        bossTagilla: { id: 'bossTagilla', normalizedName: 'tagilla' }
      },
      maps: {
        factory: {
          normalizedName: 'factory',
          bosses: [
            { mob: 'bossTagilla', spawnChance: 0.5 },
            { mob: 'bossTagilla', spawnChance: 0.25 }
          ]
        }
      }
    }
  };

  const [tagilla] = mergeBossSpawnData(localBosses, payload);
  assert.equal(tagilla.mapa, 'Factory');
  assert.equal(tagilla.spawn, '50%');
  assert.deepEqual(tagilla.spawnDetails, [{ name: 'Factory', chance: 50 }]);
});

test('Goons tracker reads the latest official JSON map report', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => response({
    data: {
      maps: {
        customs: {
          id: 'customs-id',
          normalizedName: 'customs'
        },
        woods: {
          id: 'woods-id',
          normalizedName: 'woods'
        }
      },
      goonReports: [
        { map: 'customs-id', timestamp: '1000' },
        { map: 'woods-id', timestamp: '2000' }
      ]
    }
  });

  try {
    const result = await goonsHandler({ queryStringParameters: { mode: 'pvp' } });
    const payload = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(payload.source, 'json');
    assert.equal(payload.activeMapId, 'woods');
    assert.equal(payload.reports.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Goons tracker routes Seasonal PVP to the pvp-season dataset', async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = '';
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return response({
      data: {
        maps: { woods: { id: 'woods-id', normalizedName: 'woods' } },
        goonReports: [{ map: 'woods-id', timestamp: '2000' }]
      }
    });
  };

  try {
    const result = await goonsHandler({ queryStringParameters: { mode: 'seasonal_pvp' } });
    const payload = JSON.parse(result.body);
    assert.equal(result.statusCode, 200);
    assert.equal(payload.mode, 'seasonal_pvp');
    assert.match(requestedUrl, /\/pvp-season\/maps$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Keys use official map locks and merge duplicate map variants', () => {
  const index = buildKeyMapIndex([
    {
      normalizedName: 'shoreline',
      locks: [
        { key: 'resort-104', lockType: 'door' },
        { key: 'resort-112', lockType: 'door' },
        { key: '5448ba0b4bdc2d02308b456c', lockType: 'trunk' }
      ],
      accessKeys: []
    },
    {
      normalizedName: 'factory',
      locks: [{ key: 'factory-exit' }],
      accessKeys: []
    },
    {
      normalizedName: 'night-factory',
      locks: [{ key: 'factory-exit' }],
      accessKeys: []
    }
  ]);

  assert.deepEqual(index.get('resort-104'), ['Shoreline']);
  assert.equal(index.has('5448ba0b4bdc2d02308b456c'), false);
  assert.deepEqual(index.get('factory-exit'), ['Factory']);
  assert.equal(isKeyItem({ types: ['keys'] }), true);
  assert.equal(isKeyItem({ types: ['container'], normalizedName: 'key-tool' }), false);
});

test('Hideout global needs aggregate every unbuilt level and ignore completed requirements', () => {
  const screw = { id: 'screw', name: 'Screw nuts', lastLowPrice: 1000 };
  const tape = { id: 'tape', name: 'Duct tape', lastLowPrice: 2000 };
  const roubles = { id: '5449016a4bdc2d6f028b456f', name: 'Roubles', types: ['currency'], lastLowPrice: 1 };
  const requirement = (id, item, count, fir = false) => ({
    id,
    item,
    count,
    attributes: fir ? [{ type: 'foundInRaid', value: 'true' }] : []
  });
  const stations = [
    {
      id: 'workbench',
      name: 'Workbench',
      levels: [
        { level: 1, itemRequirements: [] },
        { level: 2, itemRequirements: [requirement('screw-l2', screw, 2), requirement('tape-l2', tape, 3, true)] },
        { level: 3, itemRequirements: [requirement('screw-l3', screw, 1)] }
      ]
    },
    {
      id: 'lavatory',
      name: 'Lavatory',
      levels: [{ level: 1, itemRequirements: [requirement('screw-l1', screw, 4)] }]
    },
    {
      id: 'stash',
      name: 'Stash',
      levels: [{ level: 1, itemRequirements: [requirement('roubles-l1', roubles, 9_000_000)] }]
    }
  ];
  const markedKey = getRequirementKey('PVP', 'lavatory', 1, stations[1].levels[0].itemRequirements[0]);

  const allNeeds = getGlobalHideoutNeeds({
    stations,
    builtLevels: { workbench: 1 },
    markedItems: { [markedKey]: true },
    mode: 'PVP'
  });
  assert.equal(allNeeds.uniqueItems, 3);
  assert.equal(allNeeds.totalUnits, 6);
  assert.equal(allNeeds.estimatedCost, 9_009_000);
  assert.equal(allNeeds.firUnits, 3);
  assert.equal(allNeeds.items.find((entry) => entry.id === 'screw').count, 3);
  assert.equal(allNeeds.items.find((entry) => entry.id === roubles.id).isCurrency, true);

  const nextNeeds = getGlobalHideoutNeeds({
    stations,
    builtLevels: { workbench: 1 },
    markedItems: { [markedKey]: true },
    mode: 'PVP',
    nextLevelOnly: true
  });
  assert.equal(nextNeeds.items.find((entry) => entry.id === 'screw').count, 2);
  assert.equal(nextNeeds.totalUnits, 5);
});
