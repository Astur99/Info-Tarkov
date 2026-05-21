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
      .map((req) => req?.task?.id)
      .filter((id) => taskMap.has(id))
  }));

  let changed = true;

  for (let index = 0; index < 20 && changed; index++) {
    changed = false;

    tasksWithPrevIds.forEach((task) => {
      task._prevIds.forEach((previousId) => {
        if (levels[task.id] <= levels[previousId]) {
          levels[task.id] = levels[previousId] + 1;
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
