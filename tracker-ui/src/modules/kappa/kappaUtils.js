export const normalizeCollectorName = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getInitialTreePan = () => ({
  x: typeof window === 'undefined' ? 900 : window.innerWidth / 2,
  y: 120
});

export const QUEST_CARD_WIDTH = 340;
export const QUEST_CARD_HEIGHT = 160;
export const MAX_QUESTS_PER_ROW = 6;
const QUEST_GAP_X = 60;
const QUEST_GAP_Y = 120;
const FOREST_GAP_X = 100;
const FOREST_GAP_Y = 180;
const FOREST_MAX_WIDTH =
  MAX_QUESTS_PER_ROW * QUEST_CARD_WIDTH + (MAX_QUESTS_PER_ROW - 1) * QUEST_GAP_X;

const getRequirementStatuses = (requirement) =>
  new Set((requirement?.status || []).map((status) => String(status).toLowerCase()));

export const taskRequirementAllowsActive = (requirement) =>
  getRequirementStatuses(requirement).has('active');

export const getCompletionTaskRequirementIds = (task) =>
  (task?.taskRequirements || [])
    .filter((requirement) => !taskRequirementAllowsActive(requirement))
    .map((requirement) => requirement?.task?.id)
    .filter(Boolean);

export const getAvailableTaskIds = (tasks, completedIds = []) => {
  const completed = new Set(completedIds);
  const available = new Set();
  const taskIds = new Set(tasks.map((task) => task.id));

  let changed = true;
  for (let pass = 0; pass < tasks.length && changed; pass += 1) {
    changed = false;

    tasks.forEach((task) => {
      if (completed.has(task.id) || available.has(task.id)) return;

      const requirementsMet = (task.taskRequirements || []).every((requirement) => {
        const requiredId = requirement?.task?.id;
        if (!requiredId || !taskIds.has(requiredId)) return false;

        const statuses = getRequirementStatuses(requirement);
        if (completed.has(requiredId)) {
          return statuses.size === 0 || statuses.has('complete') || statuses.has('active');
        }

        return statuses.has('active') && available.has(requiredId);
      });

      if (requirementsMet) {
        available.add(task.id);
        changed = true;
      }
    });
  }

  return available;
};

export const buildQuestGraph = ({ tasks, currentTrader, soloKappa, soloPendientes, completadas }) => {
  const allTasksById = new Map(tasks.map((task) => [task.id, task]));
  const levels = Object.fromEntries(tasks.map((task) => [task.id, 0]));
  const allLevelRequirements = new Map(tasks.map((task) => [
    task.id,
    (task.taskRequirements || [])
      .map((requirement) => ({
        id: requirement?.task?.id,
        weight: taskRequirementAllowsActive(requirement) ? 0 : 1
      }))
      .filter((requirement) => allTasksById.has(requirement.id))
  ]));

  let changed = true;
  for (let pass = 0; pass < tasks.length && changed; pass += 1) {
    changed = false;
    tasks.forEach((task) => {
      (allLevelRequirements.get(task.id) || []).forEach(({ id: previousId, weight }) => {
        const requiredLevel = levels[previousId] + weight;
        if (levels[task.id] < requiredLevel) {
          levels[task.id] = requiredLevel;
          changed = true;
        }
      });
    });
  }

  let traderTasks = tasks.filter((task) => task.trader?.name === currentTrader);

  if (soloKappa) {
    traderTasks = traderTasks.filter((task) => task.kappaRequired);
  }

  if (soloPendientes) {
    traderTasks = traderTasks.filter((task) => !completadas.includes(task.id));
  }

  const visibleTaskMap = new Map(traderTasks.map((task) => [task.id, task]));

  const tasksWithPrevIds = traderTasks.map((task) => ({
    ...task,
    _prevIds: (task.taskRequirements || [])
      .filter((requirement) => !taskRequirementAllowsActive(requirement))
      .map((req) => req?.task?.id)
      .filter((id) => visibleTaskMap.has(id))
  }));

  const nodes = [];
  const connections = [];
  const visibleById = new Map(tasksWithPrevIds.map((task) => [task.id, task]));
  const neighbors = new Map(tasksWithPrevIds.map((task) => [task.id, new Set()]));

  tasksWithPrevIds.forEach((task) => {
    task._prevIds.forEach((previousId) => {
      neighbors.get(task.id)?.add(previousId);
      neighbors.get(previousId)?.add(task.id);
    });
  });

  const visited = new Set();
  const components = [];
  tasksWithPrevIds.forEach((task) => {
    if (visited.has(task.id)) return;
    const pending = [task.id];
    const component = [];
    visited.add(task.id);

    while (pending.length) {
      const currentId = pending.shift();
      const current = visibleById.get(currentId);
      if (current) component.push(current);
      neighbors.get(currentId)?.forEach((neighborId) => {
        if (visited.has(neighborId)) return;
        visited.add(neighborId);
        pending.push(neighborId);
      });
    }
    components.push(component);
  });

  const componentLayouts = components
    .map((component, originalIndex) => {
      const componentLevels = [...new Set(component.map((task) => levels[task.id]))]
        .sort((left, right) => left - right);
      const leadingLevels = componentLevels[0] || 0;
      const rows = componentLevels.map((level) =>
        component
          .filter((task) => levels[task.id] === level)
          .sort((left, right) => left.name.localeCompare(right.name))
      );
      const widestRow = Math.max(...rows.map((row) => row.length));
      return {
        component,
        originalIndex,
        rows,
        leadingLevels,
        width: widestRow * QUEST_CARD_WIDTH + Math.max(0, widestRow - 1) * QUEST_GAP_X,
        height: (rows.length + leadingLevels) * QUEST_CARD_HEIGHT
          + Math.max(0, rows.length + leadingLevels - 1) * QUEST_GAP_Y
      };
    })
    .sort((left, right) =>
      Number(right.component.length > 1) - Number(left.component.length > 1)
      || right.component.length - left.component.length
      || left.originalIndex - right.originalIndex
    );

  let shelfX = 0;
  let shelfY = 0;
  let shelfHeight = 0;

  componentLayouts.forEach((layout) => {
    if (shelfX > 0 && shelfX + layout.width > FOREST_MAX_WIDTH) {
      shelfX = 0;
      shelfY += shelfHeight + FOREST_GAP_Y;
      shelfHeight = 0;
    }

    layout.rows.forEach((row, rowIndex) => {
      const rowWidth = row.length * QUEST_CARD_WIDTH + Math.max(0, row.length - 1) * QUEST_GAP_X;
      const rowStartX = shelfX + (layout.width - rowWidth) / 2;
      row.forEach((task, index) => {
        nodes.push({
          ...task,
          x: rowStartX + index * (QUEST_CARD_WIDTH + QUEST_GAP_X) - FOREST_MAX_WIDTH / 2,
          y: shelfY + (rowIndex + layout.leadingLevels) * (QUEST_CARD_HEIGHT + QUEST_GAP_Y),
          prevIds: task._prevIds
        });
      });
    });

    shelfX += layout.width + FOREST_GAP_X;
    shelfHeight = Math.max(shelfHeight, layout.height);
  });

  nodes.forEach((node) => {
    node.prevIds.forEach((previousId) => {
      const parent = nodes.find((candidate) => candidate.id === previousId);

      if (parent) {
        connections.push({
          id: `${parent.id}-${node.id}`,
          from: {
            x: parent.x + QUEST_CARD_WIDTH / 2,
            y: parent.y + QUEST_CARD_HEIGHT
          },
          to: {
            x: node.x + QUEST_CARD_WIDTH / 2,
            y: node.y
          },
          activo: completadas.includes(parent.id)
        });
      }
    });
  });

  return {
    nodos: nodes,
    conexiones: connections
  };
};
