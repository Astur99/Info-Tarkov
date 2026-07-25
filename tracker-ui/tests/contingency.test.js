import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProfileCatalog } from '../netlify/functions/lib/static-items-catalog.js';
import {
  fetchServerStatus,
  normalizeStatusPayload
} from '../src/modules/server-status/serverStatusApi.js';
import { mergeBossSpawnData } from '../src/modules/bosses/bossesApi.js';

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

test('server status prefers JSON and falls back to GraphQL', async () => {
  const jsonResult = await fetchServerStatus(async () =>
    response({
      data: { currentStatuses: [{ name: 'Website', statusCode: 'OK' }] }
    })
  );
  assert.equal(jsonResult.source, 'json');

  let calls = 0;
  const fallbackResult = await fetchServerStatus(async () => {
    calls += 1;
    if (calls === 1) return response({}, { ok: false, status: 503 });
    return response({
      data: { vanguardStatus: [{ name: 'Website', status: 'ok' }] }
    });
  });
  assert.equal(fallbackResult.source, 'graphql');
  assert.equal(calls, 2);
});

test('server status never invents operational data when every source fails', async () => {
  await assert.rejects(
    fetchServerStatus(async () => response({}, { ok: false, status: 503 })),
    AggregateError
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
