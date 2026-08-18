import test from 'node:test';
import assert from 'node:assert/strict';

import {
  estimateDocumentProgress,
  getBattlePassDocumentTotals,
  getRemainingDocuments,
  normalizeDailyDocumentProgress,
  rankDocumentFarmMaps,
  recommendWildcardUse
} from '../src/modules/seasonal/kordPlanner.js';
import { BATTLE_PASS_REWARDS } from '../src/modules/seasonal/seasonalData.js';

test('current verified KORD BREACH Battle Pass requires 501 documents', () => {
  const totals = getBattlePassDocumentTotals(BATTLE_PASS_REWARDS);
  assert.equal(Object.values(totals).reduce((sum, count) => sum + count, 0), 501);
  assert.equal(totals['6a3183258f113efdb7093622'], 9);
});

test('KORD planner aggregates requirements and subtracts the selected profile inventory', () => {
  const totals = getBattlePassDocumentTotals([
    { requirements: [{ documentId: 'financial', count: 2 }, { documentId: 'project', count: 1 }] },
    { requirements: [{ documentId: 'financial', count: 3 }] }
  ]);
  assert.deepEqual(totals, { financial: 5, project: 1 });
  assert.deepEqual(getRemainingDocuments(totals, { financial: 2 }), { financial: 3, project: 1 });
});

test('KORD planner prioritizes maps that cover two missing document types', () => {
  const documents = [
    { id: 'financial', name: 'Financial', maps: ['Customs', 'Streets'] },
    { id: 'project', name: 'Project', maps: ['Customs', 'Factory'] },
    { id: 'classified', name: 'Classified', maps: ['Expansion Hub'], wildcard: true }
  ];
  const ranked = rankDocumentFarmMaps({ documents, remaining: { financial: 5, project: 2 } });
  assert.equal(ranked[0].mapName, 'Customs');
  assert.equal(ranked[0].usefulTypes, 2);
});

test('KORD planner estimates raids and days from current community limits', () => {
  assert.deepEqual(
    estimateDocumentProgress({ remaining: { a: 18, classified: 2 }, dailyLimit: 10, wildcardId: 'classified' }),
    { totalRemaining: 20, farmableRemaining: 18, estimatedRaids: 5, estimatedDays: 2 }
  );
});

test('KORD planner recommends spare classified documents against the largest shortages', () => {
  assert.deepEqual(
    recommendWildcardUse({ remaining: { a: 2, b: 7, classified: 1 }, wildcardId: 'classified', available: 4 }),
    [{ documentId: 'b', count: 4 }]
  );
});

test('daily progress resets on a new local calendar day', () => {
  const date = new Date(2026, 7, 18, 12);
  assert.deepEqual(
    normalizeDailyDocumentProgress({ day: '2026-08-17', counts: { season: 20 } }, date),
    { day: '2026-08-18', counts: { season: 0, pvp: 0, pve: 0 } }
  );
});
