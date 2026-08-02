import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuestGraph,
  getAvailableTaskIds,
  getCompletionTaskRequirementIds
} from '../src/modules/kappa/kappaUtils.js';

const requirement = (task, status) => ({ task: { id: task }, status });
const makeTask = (id, taskRequirements = []) => ({
  id,
  name: id,
  trader: { name: 'Jaeger' },
  taskRequirements
});

test('quests linked by an active requirement unlock simultaneously', () => {
  const tasks = [
    makeTask('previous'),
    makeTask('trophy', [requirement('previous', ['complete'])]),
    makeTask('justice', [requirement('trophy', ['complete', 'active'])])
  ];

  const available = getAvailableTaskIds(tasks, ['previous']);
  assert.equal(available.has('trophy'), true);
  assert.equal(available.has('justice'), true);
  assert.deepEqual(getCompletionTaskRequirementIds(tasks[2]), []);

  const graph = buildQuestGraph({
    tasks,
    currentTrader: 'Jaeger',
    soloKappa: false,
    soloPendientes: false,
    completadas: ['previous']
  });
  const trophy = graph.nodos.find((node) => node.id === 'trophy');
  const justice = graph.nodos.find((node) => node.id === 'justice');
  assert.equal(trophy.y, justice.y);
  assert.equal(graph.conexiones.some((edge) => edge.id === 'trophy-justice'), false);
});

test('optimizer eligibility excludes quests until every completion requirement is met', () => {
  const tasks = [
    makeTask('trophy'),
    makeTask('controller'),
    makeTask('sellout'),
    makeTask('stray-dogs', [
      requirement('trophy', ['complete']),
      requirement('controller', ['complete']),
      requirement('sellout', ['complete'])
    ])
  ];

  assert.equal(
    getAvailableTaskIds(tasks, ['trophy', 'controller']).has('stray-dogs'),
    false
  );
  assert.equal(
    getAvailableTaskIds(tasks, ['trophy', 'controller', 'sellout']).has('stray-dogs'),
    true
  );
});
