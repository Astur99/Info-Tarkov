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
  let traderTasks = tasks.filter((task) => task.trader?.name === currentTrader);

  if (soloKappa) {
    traderTasks = traderTasks.filter((task) => task.kappaRequired);
  }

  if (soloPendientes) {
    traderTasks = traderTasks.filter((task) => !completadas.includes(task.id));
  }

  const taskMap = new Map(traderTasks.map((task) => [task.id, task]));
  const levels = {};

  traderTasks.forEach((task) => {
    levels[task.id] = 0;
  });

  const tasksWithPrevIds = traderTasks.map((task) => ({
    ...task,
    _prevIds: (task.taskRequirements || [])
      .filter((requirement) => !taskRequirementAllowsActive(requirement))
      .map((req) => req?.task?.id)
      .filter((id) => taskMap.has(id)),
    _levelRequirements: (task.taskRequirements || [])
      .map((requirement) => ({
        id: requirement?.task?.id,
        weight: taskRequirementAllowsActive(requirement) ? 0 : 1
      }))
      .filter((requirement) => taskMap.has(requirement.id))
  }));

  let changed = true;

  for (let index = 0; index < 20 && changed; index++) {
    changed = false;

    tasksWithPrevIds.forEach((task) => {
      task._levelRequirements.forEach(({ id: previousId, weight }) => {
        const requiredLevel = levels[previousId] + weight;
        if (levels[task.id] < requiredLevel) {
          levels[task.id] = requiredLevel;
          changed = true;
        }
      });
    });
  }

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

  Object.keys(tasksByLevel).forEach((level) => {
    const list = tasksByLevel[level];
    const totalLevel = list.length;
    const totalLevelWidth = totalLevel * QUEST_CARD_WIDTH + (totalLevel - 1) * gapX;
    const startX = -totalLevelWidth / 2;

    list.forEach((task, index) => {
      const x = startX + index * (QUEST_CARD_WIDTH + gapX);
      const y = level * (QUEST_CARD_HEIGHT + gapY);

      nodes.push({
        ...task,
        x,
        y,
        prevIds: task._prevIds
      });
    });
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
