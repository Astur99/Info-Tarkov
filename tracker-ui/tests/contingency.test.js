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

const response = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body
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
