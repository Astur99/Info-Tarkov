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
import { parseReaderTimeline, parseTimelineHtml } from '../netlify/functions/tarkov-news.js';
import { buildHealthReport } from '../netlify/functions/lib/app-health.js';

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

test('health monitor validates critical PVP and PVE JSON sources', async () => {
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
