import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuestGraph,
  getAvailableTaskIds,
  getCompletionTaskRequirementIds,
  MAX_QUESTS_PER_ROW
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

test('quest graph packs independent quests without splitting a connected branch', () => {
  const roots = Array.from({ length: MAX_QUESTS_PER_ROW + 3 }, (_, index) =>
    makeTask(`root-${index}`)
  );
  const child = makeTask('child', [requirement('root-0', ['complete'])]);
  const graph = buildQuestGraph({
    tasks: [...roots, child],
    currentTrader: 'Jaeger',
    soloKappa: false,
    soloPendientes: false,
    completadas: []
  });

  const rootRows = new Set(roots.slice(1).map((task) =>
    graph.nodos.find((node) => node.id === task.id).y
  ));
  const connectedRoot = graph.nodos.find((node) => node.id === 'root-0');
  const childNode = graph.nodos.find((node) => node.id === 'child');
  assert.ok(rootRows.size >= 1);
  assert.ok(childNode.y > connectedRoot.y);
  assert.equal(childNode.x, connectedRoot.x);
  assert.equal(graph.conexiones.some((edge) => edge.id === 'root-0-child'), true);
});

test('cross-trader prerequisites influence depth without drawing a misleading local edge', () => {
  const externalParent = {
    ...makeTask('external-parent'),
    trader: { name: 'Prapor' }
  };
  const localChild = makeTask('local-child', [requirement('external-parent', ['complete'])]);
  const graph = buildQuestGraph({
    tasks: [externalParent, localChild],
    currentTrader: 'Jaeger',
    soloKappa: false,
    soloPendientes: false,
    completadas: []
  });

  assert.ok(graph.nodos.find((node) => node.id === 'local-child').y > 0);
  assert.equal(graph.conexiones.length, 0);
});
