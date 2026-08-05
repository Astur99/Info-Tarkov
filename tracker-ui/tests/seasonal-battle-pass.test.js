import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BATTLE_PASS_DOCUMENTS,
  BATTLE_PASS_REWARDS
} from '../src/modules/seasonal/seasonalData.js';

const documentIdByName = Object.fromEntries(
  BATTLE_PASS_DOCUMENTS.map((document) => [document.name, document.id])
);

const expected = {
  1: [
    ['Dogtag', [['Financial documents', 1]]],
    ['TarCoins (50)', [['Project documentation', 2], ['PMC personnel files', 1]]],
    ['Burn Poster', [['Financial documents', 2], ['Blueprints and technical documentation', 1]]],
    ['Black Division Gear Crate', [['Test documentation', 2], ['Financial documents', 1]]],
    ['Black Wood Ceiling', [['Blueprints and technical documentation', 2], ['Project documentation', 2], ['Medical documents', 1]]]
  ],
  2: [
    ['Gentex Ops-Core SOTR Respirator', [['Medical documents', 2], ['Test documentation', 2]]],
    ['Red Hawaii', [['Project documentation', 3], ['Financial documents', 3], ['Medical documents', 1]]],
    ['Black Division Gear Crate', [['Financial documents', 3]]],
    ['Scorpion Target', [['Blueprints and technical documentation', 1], ['PMC personnel files', 1], ['Test documentation', 1]]],
    ['TarCoins (50)', [['Classified documents', 2], ['Project documentation', 1]]]
  ],
  3: [
    ['Mystery Ranch NICE Frame Load Sling', [['Blueprints and technical documentation', 2], ['PMC personnel files', 1], ['Test documentation', 1]]],
    ['Black Division Gear Crate', [['PMC personnel files', 2], ['Test documentation', 2], ['Blueprints and technical documentation', 1]]],
    ['Black Herringbone', [['Project documentation', 2], ['Test documentation', 2], ['User documentation', 2], ['Classified documents', 1]]],
    ['TarCoins (50)', [['Project documentation', 2], ['Financial documents', 2], ['PMC personnel files', 1]]],
    ['Heart', [['Medical documents', 2], ['Test documentation', 1], ['PMC personnel files', 1]]]
  ],
  4: [
    ['Dogtag', [['Project documentation', 2], ['Blueprints and technical documentation', 2], ['Test documentation', 1]]],
    ['Microtech Jagdkommando Knife', [['Blueprints and technical documentation', 4], ['Classified documents', 3], ['Financial documents', 2], ['PMC personnel files', 1]]],
    ['TarCoins (50)', [['Classified documents', 3], ['User documentation', 2]]],
    ['Beware the Bear Poster', [['Test documentation', 2], ['Financial documents', 2], ['Blueprints and technical documentation', 1]]],
    ['Black Division Gear Crate', [['Technical documentation', 2], ['Medical documents', 2], ['PMC personnel files', 1]]]
  ]
};

const normalizeRequirements = (requirements) => requirements
  .map(({ documentId, count }) => ({ documentId, count }))
  .sort((left, right) => left.documentId.localeCompare(right.documentId));

test('the first four battle pass pages match the verified screenshots', () => {
  for (const [pageText, expectedRewards] of Object.entries(expected)) {
    const page = Number(pageText);
    const actualRewards = BATTLE_PASS_REWARDS
      .filter((reward) => reward.page === page)
      .sort((left, right) => left.position - right.position);

    assert.equal(actualRewards.length, 5, `Page ${page} must contain five rewards`);

    expectedRewards.forEach(([name, requirements], index) => {
      const reward = actualRewards[index];
      assert.equal(reward.name, name, `${reward.id} has the wrong name`);
      assert.equal(reward.position, index + 1, `${reward.id} has the wrong position`);
      assert.equal(reward.verifiedRequirements, true, `${reward.id} is not marked as verified`);

      const expectedRequirements = requirements.map(([documentName, count]) => ({
        documentId: documentIdByName[documentName],
        count
      }));

      assert.deepEqual(
        normalizeRequirements(reward.requirements),
        normalizeRequirements(expectedRequirements),
        `${reward.id} has the wrong document requirements`
      );
    });
  }
});
