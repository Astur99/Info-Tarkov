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

  const tasksByLevel = {};

  tasksWithPrevIds.forEach((task) => {
    const level = levels[task.id];

    if (!tasksByLevel[level]) tasksByLevel[level] = [];

    if (!tasksByLevel[level].some((current) => current.id === task.id)) {
      tasksByLevel[level].push(task);
    }
  });

  const sortedLevels = Object.keys(tasksByLevel).sort((a, b) => Number(a) - Number(b));

  sortedLevels.forEach((level, index) => {
    if (index === 0) return;

    const previousLevel = tasksByLevel[sortedLevels[index - 1]];

    tasksByLevel[level].sort((a, b) => {
      const firstParentA = a._prevIds
        .map((previousId) => previousLevel.findIndex((node) => node.id === previousId))
        .filter((parentIndex) => parentIndex !== -1)[0];

      const firstParentB = b._prevIds
        .map((previousId) => previousLevel.findIndex((node) => node.id === previousId))
        .filter((parentIndex) => parentIndex !== -1)[0];

      if (firstParentA !== undefined && firstParentB !== undefined) {
        return firstParentA - firstParentB;
      }

      return 0;
    });
  });

  const gapX = 60;
  const gapY = 120;
  const nodes = [];
  const connections = [];
  let visualRow = 0;

  sortedLevels.forEach((level) => {
    const list = tasksByLevel[level];
    visualRow = Math.max(visualRow, Number(level));
    for (let offset = 0; offset < list.length; offset += MAX_QUESTS_PER_ROW) {
      const rowTasks = list.slice(offset, offset + MAX_QUESTS_PER_ROW);
      const rowWidth = rowTasks.length * QUEST_CARD_WIDTH + (rowTasks.length - 1) * gapX;
      const startX = -rowWidth / 2;

      rowTasks.forEach((task, index) => {
        nodes.push({
          ...task,
          x: startX + index * (QUEST_CARD_WIDTH + gapX),
          y: visualRow * (QUEST_CARD_HEIGHT + gapY),
          prevIds: task._prevIds
        });
      });
      visualRow += 1;
    }
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
