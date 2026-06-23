export const MAP_BRIEFINGS = {
  groundzero: {
    tone: 'starter',
    difficulty: 'medium',
    tags: ['earlyProgression', 'compactPvP', 'questDense'],
    stats: { players: '10-12', duration: '35 min', threat: 'medium', value: 'medium' },
    conflictZones: ['terragroupLobby', 'emercomCheckpoint', 'nakatanStairs'],
    pointsOfInterest: ['capitalInsight', 'fusionCafeteria', 'undergroundParking'],
    route: ['spawnRead', 'questSweep', 'extractEarly'],
    warnings: ['verticalAudio', 'beginnerTraffic', 'openStreetCrossings']
  },
  streets: {
    tone: 'urban',
    difficulty: 'hard',
    tags: ['highLoot', 'densePvP', 'longRaid'],
    stats: { players: '12-16', duration: '50 min', threat: 'high', value: 'veryHigh' },
    conflictZones: ['lexos', 'pinewood', 'chekannaya', 'climovMall'],
    pointsOfInterest: ['relaxationRoom', 'financialBuildings', 'medicalBlocks', 'concordia'],
    route: ['edgeRoute', 'lootAnchor', 'lateExtract'],
    warnings: ['manyAngles', 'aiDensity', 'performanceRisk']
  },
  factory: {
    tone: 'closeQuarters',
    difficulty: 'hard',
    tags: ['instantPvP', 'tagilla', 'shortRaid'],
    stats: { players: '5-6', duration: '20 min', threat: 'veryHigh', value: 'low' },
    conflictZones: ['office', 'underground', 'gateThree'],
    pointsOfInterest: ['officeSafe', 'medicalTent', 'cellars'],
    route: ['surviveOpening', 'clearVerticals', 'extractFast'],
    warnings: ['noReset', 'thirdParties', 'soundPunish']
  },
  customs: {
    tone: 'progression',
    difficulty: 'medium',
    tags: ['questHub', 'dorms', 'reshala'],
    stats: { players: '10-12', duration: '40 min', threat: 'mediumHigh', value: 'medium' },
    conflictZones: ['dorms', 'stronghold', 'newGas', 'construction'],
    pointsOfInterest: ['dormsSafes', 'crackhouse', 'warehouseArea', 'bigRed'],
    route: ['chooseSide', 'avoidCenterRush', 'extractOpposite'],
    warnings: ['chokePoints', 'sniperScavs', 'questTraffic']
  },
  woods: {
    tone: 'openTerrain',
    difficulty: 'medium',
    tags: ['longRange', 'shturman', 'stashes'],
    stats: { players: '10-12', duration: '40 min', threat: 'medium', value: 'medium' },
    conflictZones: ['sawmill', 'usecCamp', 'scavBunker', 'emercomCamp'],
    pointsOfInterest: ['hiddenStashes', 'medicalCamp', 'sawmill', 'village'],
    route: ['landmarkCheck', 'edgeMovement', 'avoidSawmillNoise'],
    warnings: ['mines', 'longSightlines', 'orientationLoss']
  },
  interchange: {
    tone: 'mall',
    difficulty: 'hard',
    tags: ['killa', 'techLoot', 'darkInteriors'],
    stats: { players: '10-14', duration: '40 min', threat: 'high', value: 'high' },
    conflictZones: ['techlight', 'kiba', 'ultra', 'oliGoshanIdea'],
    pointsOfInterest: ['techStores', 'medicalRooms', 'foodShelves', 'stashes'],
    route: ['powerDecision', 'storeSweep', 'extractAwareness'],
    warnings: ['campedExtracts', 'lowVisibility', 'verticalAudio']
  },
  reserve: {
    tone: 'military',
    difficulty: 'hard',
    tags: ['glukhar', 'raiders', 'bunker'],
    stats: { players: '9-12', duration: '40 min', threat: 'high', value: 'high' },
    conflictZones: ['d2Bunker', 'trainStation', 'blackWhitePawn', 'queen'],
    pointsOfInterest: ['militaryTech', 'markedRooms', 'bishopMedical', 'bunkerSwitches'],
    route: ['extractPlanFirst', 'bunkerTiming', 'avoidTrainChaos'],
    warnings: ['extractComplexity', 'raiderSpawns', 'roofSightlines']
  },
  shoreline: {
    tone: 'resort',
    difficulty: 'mediumHigh',
    tags: ['resortPvP', 'sanitar', 'questHeavy'],
    stats: { players: '10-13', duration: '45 min', threat: 'mediumHigh', value: 'high' },
    conflictZones: ['eastWing', 'westWing', 'cottages', 'pier'],
    pointsOfInterest: ['healthResort', 'cottageSafes', 'weatherStation', 'villageStashes'],
    route: ['decideResort', 'outerQuestLoop', 'latePierCheck'],
    warnings: ['resortRush', 'openFields', 'pierTrap']
  },
  lighthouse: {
    tone: 'rogueZone',
    difficulty: 'hard',
    tags: ['rogues', 'zryachiy', 'longRange'],
    stats: { players: '9-12', duration: '40 min', threat: 'high', value: 'high' },
    conflictZones: ['waterTreatment', 'chalets', 'longRoad', 'islandBridge'],
    pointsOfInterest: ['waterTreatmentLoot', 'chalets', 'village', 'islandApproach'],
    route: ['roguePlan', 'routeBySpawn', 'avoidRoadTunnel'],
    warnings: ['rogueLasers', 'minefields', 'sniperAngles']
  },
  icebreaker: {
    tone: 'endgameAssault',
    difficulty: 'veryHard',
    tags: ['specialObjective', 'blackDivision', 'wedge', 'knight', 'verticalInterior'],
    stats: { players: '1-3', duration: '50 min', size: '34x168 m', threat: 'veryHigh', value: 'objective' },
    conflictZones: ['levelThreeGym', 'engineRooms', 'sternRoutes', 'blackDivisionPatrols'],
    pointsOfInterest: ['wedgeContact', 'shipInterior', 'lockedRooms', 'technicalCorridors'],
    route: ['secureEntry', 'clearByDecks', 'commitObjective'],
    warnings: ['guaranteedBoss', 'tightAngles', 'limitedReliableData']
  },
  labyrinth: {
    tone: 'endgamePuzzle',
    difficulty: 'veryHard',
    tags: ['specialObjective', 'trapRisk', 'tagillaVariant'],
    stats: { players: '5', duration: '40 min', size: '118x110 m', bosses: 'Vengeful Killa, Shadow of Tagilla' },
    conflictZones: ['centralMaze', 'trapSwitches', 'extractionPuzzle'],
    pointsOfInterest: ['trapControls', 'lockedRoutes', 'objectiveRooms', 'labyrinthExit'],
    route: ['moveSlow', 'markSwitches', 'commitExtract'],
    warnings: ['limitedReliableData', 'trapPunish', 'navigationPressure']
  },
  terminal: {
    tone: 'endgameArea',
    difficulty: 'veryHard',
    tags: ['endgameArea', 'bossDense', 'terminal'],
    stats: { players: '1-5', duration: '45 min', bosses: 'Glukhar, Killa, Reshala, Sanitar, Tagilla' },
    conflictZones: ['terminalApproaches', 'bossRoutes', 'containerYards'],
    pointsOfInterest: ['terminalInterior', 'industrialAccess', 'extractionRoutes'],
    route: ['awaitReliableIntel'],
    warnings: ['noStablePublicIntel']
  },
  transits: {
    tone: 'system',
    difficulty: 'variable',
    tags: ['mapLinking', 'routePlanning', 'raidChain'],
    stats: {},
    conflictZones: [],
    pointsOfInterest: [],
    route: ['planBeforeRaid', 'carryOnlyNeeded', 'confirmDestination'],
    warnings: ['wrongTransit', 'lateRaidRisk', 'inventoryCommitment']
  }
};
